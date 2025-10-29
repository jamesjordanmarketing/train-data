# Interactive LoRA Conversation Generation - Implementation Execution Instructions (E02)
**Generated**: 2025-01-29  
**Segment**: E02 - AI Integration & Generation Engine  
**Total Prompts**: 6  
**Estimated Implementation Time**: 80-100 hours

## Executive Summary

This segment implements the core AI integration infrastructure for the Training Data Generation Platform, specifically FR2.X.X requirements covering Claude API integration, prompt template management, and quality validation systems. This is a **foundational and high-risk segment** that establishes the backbone for all conversation generation functionality.

**Key Deliverables:**
1. **Rate Limiting & Retry System** (FR2.1): Production-ready Claude API integration with sliding window rate limiting, exponential backoff retry logic, and graceful error handling
2. **Prompt Template System** (FR2.2): Complete CRUD operations for templates with parameter injection, testing framework, and usage analytics
3. **Quality Validation Engine** (FR2.3): Automated quality scoring with detailed breakdown and recommendations

**Strategic Importance:**
- Enables reliable, cost-effective AI generation at scale
- Provides iteration velocity through template versioning and testing
- Ensures data quality through automated validation
- Forms dependency for all future generation workflows (Segments E03-E11)

**Risk Mitigation:**
- High complexity in rate limiting algorithms requires careful testing
- Template parameter injection must prevent security vulnerabilities (XSS, injection attacks)
- Quality scoring algorithms need validation against human judgment
- API cost tracking must be accurate for budget management

---

## Context and Dependencies

### Previous Segment Deliverables

**E01 Completion Status:**
Based on E01 execution prompt analysis, the following foundation should be in place:
- Database schema: `conversations`, `conversation_turns`, `conversation_metadata` tables
- Basic API routes: `/api/conversations` (CRUD operations)
- UI components: `DashboardView`, `ConversationTable`, `FilterBar`
- Type definitions: `Conversation`, `ConversationStatus`, `ConversationTurn` in `train-wireframe/src/lib/types.ts`
- State management: Zustand store with conversation state, filters, selections

**What E02 Builds Upon:**
- Database tables will be extended with generation logs and template storage
- API routes will be enhanced with generation endpoints
- Existing type definitions will be extended with Template, QualityMetrics, BatchJob types
- State management will incorporate generation status tracking

### Current Codebase State

**Existing Infrastructure (train-wireframe/src/):**
```
lib/
  ├── types.ts              # Core type definitions (Template, QualityMetrics already defined)
  ├── mockData.ts           # Mock data for development
  └── utils.ts              # Utility functions

stores/
  └── useAppStore.ts        # Zustand store with conversation state

components/
  ├── views/
  │   ├── TemplatesView.tsx         # Template management UI (stub)
  │   └── SettingsView.tsx          # Settings UI (stub)
  └── generation/
      ├── BatchGenerationModal.tsx  # Batch generation UI (stub)
      └── SingleGenerationForm.tsx  # Single generation UI (stub)
```

**Existing Infrastructure (src/):**
```
lib/
  ├── ai-config.ts                  # AI configuration (basic structure exists)
  ├── database.ts                   # Database service layer
  └── api-response-log-service.ts   # API logging infrastructure

app/api/
  └── chunks/generate-dimensions/   # Example of AI generation endpoint pattern
```

**Code Patterns to Follow:**
1. **API Route Pattern**: Use Next.js App Router with TypeScript, validate requests, log responses
   - Reference: `src/app/api/chunks/generate-dimensions/route.ts`
2. **Database Service Pattern**: Abstract Supabase queries behind service layer
   - Reference: `src/lib/database.ts`, `src/lib/chunk-service.ts`
3. **Type Safety**: All data structures must have TypeScript interfaces
   - Reference: `train-wireframe/src/lib/types.ts`
4. **Error Handling**: Structured error responses with user-friendly messages
   - Reference: `src/app/api/chunks/generate-dimensions/route.ts`
5. **State Management**: Zustand for client state with actions and selectors
   - Reference: `train-wireframe/src/stores/useAppStore.ts`

### Cross-Segment Dependencies

**Dependencies on E01:**
- ✅ Database schema for conversations table
- ✅ Type definitions for Conversation, ConversationStatus
- ✅ Basic CRUD API routes for conversations
- ✅ Dashboard UI with table and filters

**Provides for Future Segments:**
- Rate limiting system used by E03-E11 (all generation workflows)
- Template management used by E03 (Template Tier), E04 (Scenario Tier), E05 (Edge Case Tier)
- Quality validation used by E06 (Review Queue), E07 (Export)
- Parameter injection used by E03-E05 (all tier-specific generation)

**External Dependencies:**
- Anthropic Claude API credentials (ANTHROPIC_API_KEY environment variable)
- Supabase database with RLS policies configured
- Next.js 14+ with App Router

---

## Implementation Strategy

### Risk Assessment

**High-Risk Components:**

1. **Rate Limiting Algorithm (T-2.1.1)**
   - **Risk**: Complex sliding window algorithm prone to edge cases and race conditions
   - **Impact**: API throttling, generation failures, user frustration
   - **Mitigation**: 
     - Implement comprehensive unit tests with edge cases
     - Add monitoring and alerting for rate limit violations
     - Include manual override for testing
     - Start with conservative limits and gradually increase

2. **Parameter Injection Security (T-2.4.1)**
   - **Risk**: Template variable injection vulnerabilities (XSS, code injection)
   - **Impact**: Security breach, malicious content generation
   - **Mitigation**:
     - HTML escape all injected parameters
     - Validate parameter types strictly
     - Implement CSP headers
     - Security review before production deployment

3. **API Cost Tracking (T-2.6.1)**
   - **Risk**: Inaccurate cost calculations leading to budget overruns
   - **Impact**: Financial loss, user trust erosion
   - **Mitigation**:
     - Use Claude's token counting endpoint for accuracy
     - Log all token counts and costs
     - Implement spending caps with alerts
     - Monthly reconciliation with Anthropic billing

4. **Quality Scoring Accuracy (T-2.7.1)**
   - **Risk**: Automated scores diverge from human judgment
   - **Impact**: Low-quality data in training sets, wasted generation costs
   - **Mitigation**:
     - Validate scoring algorithm against 100 human-reviewed conversations
     - Implement feedback loop to improve scoring
     - Allow manual override of scores
     - Regular calibration reviews

**Medium-Risk Components:**
- Template versioning and rollback (data integrity)
- Retry strategy infinite loops (system stability)
- Analytics aggregation performance (scalability)

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Foundation - AI Configuration & Rate Limiting Core**
- **Why First**: Establishes the fundamental infrastructure that all other prompts depend on
- **What**: AI config, rate limiter with sliding window, request queue
- **Dependencies**: None (foundational)
- **Risk**: High (complex algorithm)

**Prompt 2: API Integration - Retry Strategy & Error Handling**
- **Why Second**: Builds on rate limiting to add resilience and error recovery
- **What**: Retry strategies, error classification, exponential backoff
- **Dependencies**: Prompt 1 (rate limiter)
- **Risk**: Medium (error handling complexity)

**Prompt 3: Template Management - CRUD & Storage**
- **Why Third**: Enables template creation before generation workflows
- **What**: Template API endpoints, UI components, database operations
- **Dependencies**: Prompt 1 (database patterns)
- **Risk**: Low (standard CRUD)

**Prompt 4: Template Engine - Parameter Injection & Validation**
- **Why Fourth**: Requires templates from Prompt 3 to be in place
- **What**: Parameter resolution, validation, security escaping
- **Dependencies**: Prompt 3 (templates exist)
- **Risk**: High (security vulnerabilities)

**Prompt 5: Template Testing & Analytics**
- **Why Fifth**: Requires template engine from Prompt 4 to function
- **What**: Test framework, usage tracking, analytics dashboard
- **Dependencies**: Prompts 3, 4 (templates and injection)
- **Risk**: Medium (analytics performance)

**Prompt 6: Quality Validation System**
- **Why Last**: Independent system that can be developed in parallel but tested after generation works
- **What**: Quality scoring, breakdown display, auto-flagging
- **Dependencies**: Prompt 1 (for testing with real generation)
- **Risk**: High (scoring accuracy)

**Parallelization Opportunities:**
- Prompts 3 and 6 can be developed in parallel (independent systems)
- Prompt 5 analytics can be developed after Prompt 3 in parallel with Prompt 4

### Quality Assurance Approach

**Per-Prompt Validation:**
1. Unit tests for business logic (80%+ coverage target)
2. Integration tests for API endpoints (all endpoints)
3. Manual testing with UI components
4. Code review focusing on security and performance

**Cross-Prompt Integration:**
1. End-to-end test: Generate conversation using templates with rate limiting
2. Load test: Generate 100 conversations simultaneously
3. Error injection test: Verify retry logic with simulated API failures
4. Security audit: Template injection attack testing

**Acceptance Gates:**
- All TypeScript compilation errors resolved
- All ESLint warnings addressed
- All unit tests passing
- Integration tests passing for API routes
- Manual verification of UI workflows
- Performance benchmarks met (<500ms for DB queries, <2s for API calls)

---

## Database Setup Instructions

### Required SQL Operations

**New Tables:**
1. `generation_logs` - API request/response logging
2. `prompt_templates` - Template storage with versioning
3. `template_analytics` - Usage and performance metrics

**Modifications to Existing Tables:**
None required (E01 schema sufficient)

========================

```sql
-- =====================================================
-- E02 Database Schema - AI Integration & Generation
-- Execute in Supabase SQL Editor
-- =====================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: prompt_templates
-- Purpose: Store conversation prompt templates with versioning
-- =====================================================
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template identification
  template_name TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Template content
  template_text TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('template', 'scenario', 'edge_case')),
  tier TEXT NOT NULL CHECK (tier IN ('template', 'scenario', 'edge_case')),
  
  -- Template variables
  variables JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_parameters TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  
  -- Applicability rules
  applicable_personas TEXT[],
  applicable_emotions TEXT[],
  
  -- Template metadata
  description TEXT,
  style_notes TEXT,
  example_conversation TEXT,
  quality_threshold DECIMAL(3, 2) DEFAULT 0.70,
  
  -- Status and usage
  is_active BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2),
  
  -- Audit fields
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Constraints
  UNIQUE (template_name, version)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_templates_active ON prompt_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_type ON prompt_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_templates_tier ON prompt_templates(tier);
CREATE INDEX IF NOT EXISTS idx_templates_usage ON prompt_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON prompt_templates(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_templates_created ON prompt_templates(created_at DESC);

-- GIN index for JSONB variables
CREATE INDEX IF NOT EXISTS idx_templates_variables ON prompt_templates USING GIN(variables);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_template_timestamp();

-- =====================================================
-- Table: generation_logs
-- Purpose: Comprehensive audit log for all AI API calls
-- =====================================================
CREATE TABLE IF NOT EXISTS generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Generation context
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  run_id UUID, -- For batch job tracking
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,
  
  -- Request/Response data
  request_payload JSONB NOT NULL,
  response_payload JSONB,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Cost tracking
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd DECIMAL(10, 6),
  
  -- Performance metrics
  duration_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failure', 'timeout')),
  error_message TEXT,
  error_type TEXT,
  retry_attempt INTEGER NOT NULL DEFAULT 0,
  
  -- API metadata
  model_name TEXT NOT NULL DEFAULT 'claude-3-5-sonnet-20241022',
  api_version TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_generation_logs_conversation ON generation_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_run ON generation_logs(run_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_template ON generation_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created ON generation_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_error_type ON generation_logs(error_type) WHERE error_type IS NOT NULL;

-- GIN indexes for JSONB
CREATE INDEX IF NOT EXISTS idx_generation_logs_request ON generation_logs USING GIN(request_payload);
CREATE INDEX IF NOT EXISTS idx_generation_logs_response ON generation_logs USING GIN(response_payload);
CREATE INDEX IF NOT EXISTS idx_generation_logs_parameters ON generation_logs USING GIN(parameters);

-- =====================================================
-- Table: template_analytics
-- Purpose: Aggregated performance metrics per template
-- =====================================================
CREATE TABLE IF NOT EXISTS template_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template reference
  template_id UUID NOT NULL REFERENCES prompt_templates(id) ON DELETE CASCADE,
  
  -- Time period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Usage metrics
  generation_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  
  -- Quality metrics
  avg_quality_score DECIMAL(3, 2),
  min_quality_score DECIMAL(3, 2),
  max_quality_score DECIMAL(3, 2),
  
  -- Approval metrics
  approval_count INTEGER NOT NULL DEFAULT 0,
  rejection_count INTEGER NOT NULL DEFAULT 0,
  approval_rate DECIMAL(5, 2),
  
  -- Performance metrics
  avg_duration_ms INTEGER,
  avg_cost_usd DECIMAL(10, 6),
  total_cost_usd DECIMAL(10, 6),
  
  -- Audit
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (template_id, period_start, period_end)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_analytics_template ON template_analytics(template_id);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON template_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_analytics_calculated ON template_analytics(calculated_at DESC);

-- =====================================================
-- RLS Policies
-- Purpose: Row-level security for multi-tenant data isolation
-- =====================================================

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_analytics ENABLE ROW LEVEL SECURITY;

-- Templates: Users can read active templates, manage own templates
CREATE POLICY "Users can view active templates"
  ON prompt_templates FOR SELECT
  USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates"
  ON prompt_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates"
  ON prompt_templates FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON prompt_templates FOR DELETE
  USING (created_by = auth.uid());

-- Generation logs: Users can view and create their own logs
CREATE POLICY "Users can view own generation logs"
  ON generation_logs FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create generation logs"
  ON generation_logs FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Template analytics: Users can view analytics for accessible templates
CREATE POLICY "Users can view template analytics"
  ON template_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM prompt_templates
    WHERE prompt_templates.id = template_analytics.template_id
    AND (prompt_templates.is_active = true OR prompt_templates.created_by = auth.uid())
  ));

-- =====================================================
-- Seed Data: Default Templates
-- Purpose: Provide starter templates for immediate use
-- =====================================================

-- Insert sample template (Tier 1: Template)
INSERT INTO prompt_templates (
  template_name,
  template_text,
  template_type,
  tier,
  variables,
  required_parameters,
  applicable_personas,
  description,
  quality_threshold,
  is_active
) VALUES (
  'Default Financial Planning Conversation',
  'You are a knowledgeable financial advisor having a conversation with {{persona}}. The client is experiencing {{emotion}} about {{topic}}. Create a natural, helpful conversation that demonstrates expertise while addressing their emotional state. The conversation should have 8-16 turns with the client asking questions and you providing thoughtful, personalized advice.',
  'template',
  'template',
  '[
    {"name": "persona", "type": "text", "defaultValue": "", "helpText": "Client persona (e.g., Anxious Investor, Confident Planner)"},
    {"name": "emotion", "type": "text", "defaultValue": "", "helpText": "Primary emotion (e.g., fear, excitement, confusion)"},
    {"name": "topic", "type": "text", "defaultValue": "", "helpText": "Financial topic (e.g., retirement planning, investment strategy)"}
  ]'::jsonb,
  ARRAY['persona', 'emotion', 'topic'],
  ARRAY['Anxious Investor', 'Confident Planner', 'Skeptical Beginner', 'Experienced Trader'],
  'General-purpose template for financial planning conversations with emotional intelligence',
  0.70,
  true
);

-- Insert sample template (Tier 2: Scenario)
INSERT INTO prompt_templates (
  template_name,
  template_text,
  template_type,
  tier,
  variables,
  required_parameters,
  description,
  quality_threshold,
  is_active
) VALUES (
  'Market Volatility Scenario',
  'Create a conversation where {{persona}} is concerned about recent market volatility. They have {{investment_amount}} invested and are {{years_to_retirement}} years from retirement. Address their specific situation with actionable advice.',
  'scenario',
  'scenario',
  '[
    {"name": "persona", "type": "text", "defaultValue": "", "helpText": "Client persona"},
    {"name": "investment_amount", "type": "text", "defaultValue": "", "helpText": "Total investment amount"},
    {"name": "years_to_retirement", "type": "number", "defaultValue": "10", "helpText": "Years until retirement"}
  ]'::jsonb,
  ARRAY['persona', 'investment_amount', 'years_to_retirement'],
  'Scenario-based template for market volatility concerns',
  0.75,
  true
);

COMMIT;

-- =====================================================
-- Verification Queries
-- Execute to verify successful setup
-- =====================================================

-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('prompt_templates', 'generation_logs', 'template_analytics');

-- Check indexes created
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('prompt_templates', 'generation_logs', 'template_analytics');

-- Check RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('prompt_templates', 'generation_logs', 'template_analytics');

-- Check seed data
SELECT template_name, is_active, tier FROM prompt_templates;
```

++++++++++++++++++


**Post-Execution Verification:**
1. Run verification queries to confirm tables, indexes, and policies created
2. Test RLS policies with authenticated user session
3. Verify seed templates are visible and usable
4. Check that all foreign key constraints are working

---

## Implementation Prompts

### Prompt 1: AI Configuration & Rate Limiting Infrastructure
**Scope**: Implement foundation AI configuration, sliding window rate limiter, and request queue  
**Dependencies**: Database schema from E01, E02 SQL setup complete  
**Estimated Time**: 16-20 hours  
**Risk Level**: High (complex algorithm, critical path)

========================

You are a senior full-stack developer implementing the AI configuration and rate limiting infrastructure for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This platform enables small businesses to generate 90-100 high-quality training conversations for LoRA fine-tuning. The AI Integration & Generation Engine (FR2.X.X) provides the foundation for all conversation generation workflows. This prompt establishes the critical rate limiting infrastructure that prevents API throttling and ensures reliable, cost-effective generation at scale.

**Functional Requirements Being Implemented:**
- **FR2.1.1: Automatic Rate Limiting** - Implement rate limiting respecting Claude API constraints with graceful degradation
  - Rate limiting respecting Claude API limits (50 requests/minute default)
  - Sliding window algorithm tracking requests per minute
  - API calls queued when approaching 90% of rate limit threshold
  - Rate limit errors (429 status) trigger automatic queue pause
  - Configurable rate limits for different API tiers (Opus, Sonnet, Haiku)
  - Rate limit metrics logged for capacity planning

**Technical Architecture:**
- **Frontend**: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js runtime
- **AI Provider**: Anthropic Claude API (claude-3-5-sonnet-20241022)
- **Database**: Supabase PostgreSQL
- **State Management**: Zustand for client-side state

**CURRENT CODEBASE STATE:**

**Existing AI Configuration (src/lib/ai-config.ts):**
```typescript
// Basic structure exists, needs enhancement
export const AI_CONFIG = {
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.7,
  maxTokens: 4096,
  // Rate limiting configuration needs to be added
};
```

**Existing API Logging Pattern (src/lib/api-response-log-service.ts):**
The codebase has an established pattern for logging API responses. Follow this pattern for generation logs.

**Existing Type Definitions (train-wireframe/src/lib/types.ts):**
```typescript
// BatchJob type already defined (lines 130-141)
export type BatchJob = {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  completedItems: number;
  failedItems: number;
  currentItem?: string;
  progress: number; // 0-100
  priority: 'low' | 'normal' | 'high';
  retryConfig?: {
    maxRetries: number;
    backoffStrategy: 'exponential' | 'linear' | 'fixed';
    maxBackoffMs: number;
    continueOnError: boolean;
  };
  concurrentProcessing: number;
};
```

**IMPLEMENTATION TASKS:**

**Task T-2.1.1: Sliding Window Rate Limiter Core**

1. **Create Rate Limiter Module** (`src/lib/ai/rate-limiter.ts`):
   - Implement `RequestTracker` class tracking request timestamps within sliding window
   - Use in-memory array to store timestamps (upgrade to Redis for production scaling)
   - Implement `addRequest()` method adding current timestamp
   - Implement `removeExpiredRequests()` method cleaning timestamps outside window
   - Implement `getCurrentCount()` method returning active request count
   - Implement `canMakeRequest()` method checking against limit
   - Support configurable window size (default 60 seconds) and request limit (default 50)
   
2. **Create Rate Limit Checker**:
   - Method `checkRateLimit(apiTier: string): Promise<boolean>`
   - Calculate current utilization percentage
   - Return true if below 90% threshold, false otherwise
   - Log rate limit checks for monitoring
   
3. **Create Request Queue** (`src/lib/ai/request-queue.ts`):
   - Implement `RequestQueue` class using priority queue data structure
   - Support priority levels: low, normal, high
   - Implement `enqueue(request, priority)` method
   - Implement `dequeue()` method respecting priority order
   - Implement `isEmpty()` and `size()` methods
   - Track queue metrics: total enqueued, total processed, current size

4. **Enhance AI Configuration** (`src/lib/ai-config.ts`):
   ```typescript
   export const AI_CONFIG = {
     // Model configuration
     models: {
       opus: {
         name: 'claude-3-opus-20240229',
         rateLimit: 40,
         rateLimitWindow: 60,
         costPerMillionInputTokens: 15,
         costPerMillionOutputTokens: 75,
       },
       sonnet: {
         name: 'claude-3-5-sonnet-20241022',
         rateLimit: 50,
         rateLimitWindow: 60,
         costPerMillionInputTokens: 3,
         costPerMillionOutputTokens: 15,
       },
       haiku: {
         name: 'claude-3-haiku-20240307',
         rateLimit: 60,
         rateLimitWindow: 60,
         costPerMillionInputTokens: 0.25,
         costPerMillionOutputTokens: 1.25,
       },
     },
     defaultModel: 'sonnet',
     
     // Rate limiting
     rateLimitThreshold: 0.9, // Pause at 90% capacity
     rateLimitPauseMs: 5000, // Pause for 5 seconds when rate limited
     
     // Request configuration
     timeout: 60000, // 60 seconds
     maxConcurrentRequests: 3,
   };
   ```

5. **Create Rate Limiter Singleton** (`src/lib/ai/rate-limiter.ts`):
   - Export singleton instance: `export const rateLimiter = new RateLimiter(AI_CONFIG)`
   - Ensure single instance across application
   - Initialize on first import

**Task T-2.1.2: Request Queue Management**

6. **Implement Queue Processor** (`src/lib/ai/queue-processor.ts`):
   - Create `processQueue()` function running continuously
   - Check rate limiter before dequeuing requests
   - Process requests respecting concurrency limit (default 3)
   - Integrate with rate limiter for throttling
   - Implement graceful shutdown on process termination
   
7. **Create Queue Status Endpoint** (`src/app/api/ai/queue-status/route.ts`):
   ```typescript
   GET /api/ai/queue-status
   Response: {
     queueSize: number;
     currentUtilization: number; // 0-100%
     estimatedWaitTime: number; // milliseconds
     rateLimitStatus: 'healthy' | 'approaching' | 'throttled';
   }
   ```

**Task T-2.1.3: Rate Limit UI Feedback**

8. **Enhance Batch Generation Modal** (`train-wireframe/src/components/generation/BatchGenerationModal.tsx`):
   - Add rate limit status indicator component
   - Display current utilization percentage with color coding:
     - Green (0-70%): "API Rate: Healthy"
     - Yellow (70-90%): "API Rate: Busy"
     - Red (90-100%): "API Rate: Throttled - Pausing..."
   - Add countdown timer when rate limited
   - Poll `/api/ai/queue-status` every 3 seconds during generation
   - Display queue size and estimated wait time

9. **Create Rate Limit Notification System**:
   - Use Sonner toast notifications for rate limit events
   - Toast on approaching limit (90%): "Generation slowing down - approaching API rate limit"
   - Toast on rate limit hit (100%): "Pausing generation for 30 seconds to respect API limits..."
   - Toast on resumption: "Generation resumed"

**ACCEPTANCE CRITERIA:**

**Functional:**
- [ ] Rate limiter correctly tracks requests within 60-second sliding window
- [ ] Requests queued when utilization exceeds 90%
- [ ] Rate limit status displayed in UI with accurate percentages
- [ ] Queue processes requests respecting rate limits
- [ ] 429 errors from Claude API trigger automatic pause
- [ ] System recovers automatically after rate limit pause
- [ ] Multiple API tiers (Opus, Sonnet, Haiku) supported with different limits
- [ ] Concurrent request limit enforced (max 3 simultaneous)

**Technical:**
- [ ] All TypeScript interfaces defined for rate limiter, queue, and config
- [ ] Unit tests for `RequestTracker` with edge cases (boundary conditions, time wraparound)
- [ ] Unit tests for `RequestQueue` with priority ordering
- [ ] Rate limiter singleton pattern implemented correctly
- [ ] No memory leaks in timestamp tracking (expired timestamps cleaned)
- [ ] Thread-safe queue operations (use locks if needed)
- [ ] Graceful degradation on rate limit errors

**Performance:**
- [ ] Rate limit check completes in <5ms
- [ ] Queue enqueue/dequeue operations complete in <10ms
- [ ] Memory usage stable with 1000+ requests tracked
- [ ] UI updates without lag (<100ms response time)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
```
src/lib/ai/
  ├── rate-limiter.ts          # Core rate limiting logic
  ├── request-queue.ts         # Priority queue implementation
  ├── queue-processor.ts       # Background queue processing
  └── types.ts                 # Type definitions for AI system

src/app/api/ai/
  └── queue-status/route.ts    # Queue status API endpoint

train-wireframe/src/components/generation/
  └── BatchGenerationModal.tsx # Enhanced with rate limit UI
```

**Data Models:**

```typescript
// src/lib/ai/types.ts
export interface RateLimitConfig {
  requestLimit: number;
  windowSeconds: number;
  threshold: number; // 0-1 (0.9 = 90%)
  pauseMs: number;
}

export interface RequestTimestamp {
  timestamp: number;
  requestId: string;
}

export interface QueueItem {
  id: string;
  priority: 'low' | 'normal' | 'high';
  payload: any;
  enqueuedAt: number;
  retryCount: number;
}

export interface RateLimitStatus {
  currentCount: number;
  limit: number;
  utilization: number; // 0-100%
  canMakeRequest: boolean;
  estimatedWaitMs: number;
}
```

**API Specifications:**

```typescript
// GET /api/ai/queue-status
export async function GET(request: Request) {
  const status = rateLimiter.getStatus();
  const queueInfo = requestQueue.getInfo();
  
  return Response.json({
    queueSize: queueInfo.size,
    currentUtilization: status.utilization,
    estimatedWaitTime: queueInfo.size * 20000, // 20s per request average
    rateLimitStatus: 
      status.utilization < 70 ? 'healthy' :
      status.utilization < 90 ? 'approaching' :
      'throttled',
  });
}
```

**Error Handling:**
- Rate limit errors (429): Pause queue, wait configured duration, resume
- Network errors: Retry with exponential backoff (handled in Prompt 2)
- Timeout errors: Mark request as failed, continue processing queue
- Queue overflow: Reject new requests with clear error message

**Testing Requirements:**

1. **Unit Tests** (`src/lib/ai/__tests__/rate-limiter.test.ts`):
   ```typescript
   describe('RateLimiter', () => {
     test('tracks requests within window', () => {
       // Test adding requests and counting
     });
     
     test('removes expired requests', () => {
       // Test cleanup of old timestamps
     });
     
     test('correctly calculates utilization', () => {
       // Test utilization percentage calculation
     });
     
     test('enforces rate limit threshold', () => {
       // Test blocking at 90% capacity
     });
   });
   ```

2. **Integration Tests** (`src/app/api/ai/__tests__/queue-status.test.ts`):
   ```typescript
   describe('Queue Status API', () => {
     test('returns current queue state', async () => {
       // Test API endpoint response
     });
   });
   ```

3. **Manual Testing Checklist:**
   - [ ] Start batch generation with 50 conversations
   - [ ] Observe rate limit indicator updating in real-time
   - [ ] Verify queue pauses at 90% utilization
   - [ ] Verify generation resumes after pause
   - [ ] Test with different API tiers (Opus, Sonnet, Haiku)
   - [ ] Simulate 429 error and verify automatic recovery

**VALIDATION REQUIREMENTS:**

1. **Functional Validation:**
   - Generate test batch of 20 conversations
   - Monitor rate limit indicator throughout process
   - Verify no 429 errors from Claude API
   - Confirm all conversations generated successfully

2. **Performance Validation:**
   - Measure rate limit check latency (target <5ms)
   - Measure queue operations latency (target <10ms)
   - Monitor memory usage during 100-conversation batch

3. **Security Validation:**
   - Verify rate limiter cannot be bypassed
   - Confirm API keys not exposed in logs
   - Test RLS policies on generation_logs table

**DELIVERABLES:**

**New Files:**
- `src/lib/ai/rate-limiter.ts` (200-300 lines)
- `src/lib/ai/request-queue.ts` (150-200 lines)
- `src/lib/ai/queue-processor.ts` (100-150 lines)
- `src/lib/ai/types.ts` (50-100 lines)
- `src/app/api/ai/queue-status/route.ts` (50-100 lines)

**Modified Files:**
- `src/lib/ai-config.ts` (enhanced with rate limit config)
- `train-wireframe/src/components/generation/BatchGenerationModal.tsx` (add rate limit UI)

**Tests:**
- `src/lib/ai/__tests__/rate-limiter.test.ts`
- `src/lib/ai/__tests__/request-queue.test.ts`
- `src/app/api/ai/__tests__/queue-status.test.ts`

**Documentation:**
- Inline JSDoc comments for all public methods
- README.md in `src/lib/ai/` explaining architecture

Implement this feature completely, ensuring all acceptance criteria are met and the implementation follows established patterns and best practices. Focus on correctness and reliability over premature optimization.


++++++++++++++++++


### Prompt 2: Retry Strategy & Error Handling System
**Scope**: Implement configurable retry strategies with exponential backoff and comprehensive error classification  
**Dependencies**: Prompt 1 (rate limiter must exist)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium (error handling complexity)

========================

You are a senior backend developer implementing the retry strategy and error handling system for the AI Integration & Generation Engine.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Building on the rate limiting infrastructure from Prompt 1, this prompt adds resilience through intelligent retry strategies and comprehensive error handling. The system must gracefully handle API failures, network issues, and timeout errors while providing clear feedback to users.

**Functional Requirements Being Implemented:**
- **FR2.1.2: Retry Strategy Configuration** - Configurable retry behavior for different error types
  - Error types categorized: retryable (rate limit, timeout, 5xx) vs non-retryable (validation, 4xx)
  - Exponential backoff formula: delay = base_delay * (2 ^ attempt_number) + random_jitter
  - Maximum backoff delay capped at 5 minutes
  - Timeout duration configurable per batch (default 60 seconds)
  - Error handling configuration: 'continue' (skip failed) or 'stop' (halt batch)
  - Retry metrics logged: attempts, success rate, time to success

**CURRENT CODEBASE STATE:**

**From Prompt 1:**
- Rate limiter established in `src/lib/ai/rate-limiter.ts`
- Request queue in `src/lib/ai/request-queue.ts`
- AI configuration in `src/lib/ai-config.ts`

**Existing Batch Job Type (train-wireframe/src/lib/types.ts:139-143):**
```typescript
retryConfig?: {
  maxRetries: number;
  backoffStrategy: 'exponential' | 'linear' | 'fixed';
  maxBackoffMs: number;
  continueOnError: boolean;
};
```

**IMPLEMENTATION TASKS:**

**Task T-2.2.1: Retry Strategy Engine**

1. **Create Retry Strategy Interface** (`src/lib/ai/retry-strategy.ts`):
   ```typescript
   export interface RetryStrategy {
     calculateDelay(attemptNumber: number): number;
     shouldRetry(error: Error, attemptNumber: number): boolean;
     maxAttempts: number;
   }
   ```

2. **Implement Exponential Backoff Strategy**:
   ```typescript
   export class ExponentialBackoffStrategy implements RetryStrategy {
     constructor(
       private baseDelayMs: number = 1000,
       public maxAttempts: number = 3,
       private maxDelayMs: number = 300000, // 5 minutes
       private jitterFactor: number = 0.1
     ) {}
     
     calculateDelay(attemptNumber: number): number {
       const exponentialDelay = this.baseDelayMs * Math.pow(2, attemptNumber);
       const jitter = exponentialDelay * this.jitterFactor * Math.random();
       const totalDelay = exponentialDelay + jitter;
       return Math.min(totalDelay, this.maxDelayMs);
     }
     
     shouldRetry(error: Error, attemptNumber: number): boolean {
       if (attemptNumber >= this.maxAttempts) return false;
       return ErrorClassifier.isRetryable(error);
     }
   }
   ```

3. **Implement Linear Backoff Strategy**:
   ```typescript
   export class LinearBackoffStrategy implements RetryStrategy {
     constructor(
       private incrementMs: number = 2000,
       public maxAttempts: number = 3,
       private maxDelayMs: number = 300000
     ) {}
     
     calculateDelay(attemptNumber: number): number {
       const delay = this.incrementMs * attemptNumber;
       return Math.min(delay, this.maxDelayMs);
     }
     
     shouldRetry(error: Error, attemptNumber: number): boolean {
       if (attemptNumber >= this.maxAttempts) return false;
       return ErrorClassifier.isRetryable(error);
     }
   }
   ```

4. **Implement Fixed Delay Strategy**:
   ```typescript
   export class FixedDelayStrategy implements RetryStrategy {
     constructor(
       private delayMs: number = 5000,
       public maxAttempts: number = 3
     ) {}
     
     calculateDelay(attemptNumber: number): number {
       return this.delayMs;
     }
     
     shouldRetry(error: Error, attemptNumber: number): boolean {
       if (attemptNumber >= this.maxAttempts) return false;
       return ErrorClassifier.isRetryable(error);
     }
   }
   ```

5. **Create Error Classifier** (`src/lib/ai/error-classifier.ts`):
   ```typescript
   export class ErrorClassifier {
     static isRetryable(error: Error): boolean {
       // Network errors - retryable
       if (error.message.includes('ECONNREFUSED') ||
           error.message.includes('ETIMEDOUT') ||
           error.message.includes('Network request failed')) {
         return true;
       }
       
       // Rate limit errors - retryable
       if (error.message.includes('429') ||
           error.message.includes('rate limit')) {
         return true;
       }
       
       // Server errors (5xx) - retryable
       if (error.message.includes('500') ||
           error.message.includes('502') ||
           error.message.includes('503') ||
           error.message.includes('504')) {
         return true;
       }
       
       // Client errors (4xx except 429) - not retryable
       if (error.message.includes('400') ||
           error.message.includes('401') ||
           error.message.includes('403') ||
           error.message.includes('404')) {
         return false;
       }
       
       // Validation errors - not retryable
       if (error.message.includes('validation') ||
           error.message.includes('invalid')) {
         return false;
       }
       
       // Default: not retryable (conservative approach)
       return false;
     }
     
     static categorizeError(error: Error): 'network' | 'rate_limit' | 'server' | 'client' | 'validation' | 'timeout' | 'unknown' {
       // Categorization logic
     }
   }
   ```

6. **Create Retry Executor** (`src/lib/ai/retry-executor.ts`):
   ```typescript
   export class RetryExecutor {
     constructor(private strategy: RetryStrategy) {}
     
     async execute<T>(
       fn: () => Promise<T>,
       context: { conversationId?: string; requestId: string }
     ): Promise<T> {
       let lastError: Error;
       
       for (let attempt = 0; attempt <= this.strategy.maxAttempts; attempt++) {
         try {
           // Log attempt
           console.log(`[${context.requestId}] Attempt ${attempt + 1}/${this.strategy.maxAttempts}`);
           
           // Execute function
           const result = await fn();
           
           // Log success
           if (attempt > 0) {
             console.log(`[${context.requestId}] Succeeded after ${attempt + 1} attempts`);
             await this.logRetrySuccess(context, attempt + 1);
           }
           
           return result;
           
         } catch (error) {
           lastError = error as Error;
           
           // Check if should retry
           if (!this.strategy.shouldRetry(lastError, attempt)) {
             console.log(`[${context.requestId}] Non-retryable error or max attempts reached`);
             await this.logRetryFailure(context, attempt + 1, lastError);
             throw lastError;
           }
           
           // Calculate delay
           const delay = this.strategy.calculateDelay(attempt);
           console.log(`[${context.requestId}] Retry in ${delay}ms...`);
           
           // Wait before retrying
           await this.sleep(delay);
         }
       }
       
       // All retries exhausted
       await this.logRetryFailure(context, this.strategy.maxAttempts, lastError!);
       throw lastError!;
     }
     
     private sleep(ms: number): Promise<void> {
       return new Promise(resolve => setTimeout(resolve, ms));
     }
     
     private async logRetrySuccess(context: any, attempts: number) {
       // Log to database
     }
     
     private async logRetryFailure(context: any, attempts: number, error: Error) {
       // Log to database
     }
   }
   ```

**Task T-2.2.2: Retry Configuration UI**

7. **Enhance Settings View** (`train-wireframe/src/components/views/SettingsView.tsx`):
   - Add "Retry Configuration" section
   - Form fields:
     - Strategy selector: Exponential | Linear | Fixed
     - Max retry attempts: Number input (1-10)
     - Base delay (ms): Number input (1000-10000)
     - Max delay (ms): Number input (10000-300000)
     - Error handling: Radio buttons (Continue on error | Stop on error)
   - "Test Retry Logic" button triggering simulation
   - Save configuration to user preferences

8. **Create Retry Simulation Modal**:
   - Modal component: `RetrySimulationModal.tsx`
   - Simulate API call with configurable failure rate
   - Display retry attempts in real-time
   - Show calculated delays between attempts
   - Log simulation results

9. **Enhance AI Config** (`src/lib/ai-config.ts`):
   ```typescript
   retryConfig: {
     defaultStrategy: 'exponential',
     exponential: {
       baseDelayMs: 1000,
       maxAttempts: 3,
       maxDelayMs: 300000,
       jitterFactor: 0.1,
     },
     linear: {
       incrementMs: 2000,
       maxAttempts: 3,
       maxDelayMs: 300000,
     },
     fixed: {
       delayMs: 5000,
       maxAttempts: 3,
     },
   }
   ```

**Task T-2.2.3: Integration with Generation System**

10. **Create Retry-Aware Generation Client** (`src/lib/ai/generation-client.ts`):
    ```typescript
    export class GenerationClient {
      private rateLimiter: RateLimiter;
      private retryExecutor: RetryExecutor;
      
      constructor(config: AIConfig) {
        this.rateLimiter = new RateLimiter(config);
        const strategy = this.createStrategy(config.retryConfig);
        this.retryExecutor = new RetryExecutor(strategy);
      }
      
      async generateConversation(
        templateId: string,
        parameters: Record<string, any>
      ): Promise<Conversation> {
        // Check rate limit
        if (!await this.rateLimiter.canMakeRequest()) {
          await this.rateLimiter.waitForAvailability();
        }
        
        // Execute with retry logic
        return await this.retryExecutor.execute(
          async () => {
            // Actual Claude API call
            return await this.callClaudeAPI(templateId, parameters);
          },
          { requestId: generateId(), templateId }
        );
      }
      
      private createStrategy(config: any): RetryStrategy {
        switch (config.defaultStrategy) {
          case 'exponential':
            return new ExponentialBackoffStrategy(
              config.exponential.baseDelayMs,
              config.exponential.maxAttempts,
              config.exponential.maxDelayMs,
              config.exponential.jitterFactor
            );
          case 'linear':
            return new LinearBackoffStrategy(
              config.linear.incrementMs,
              config.linear.maxAttempts,
              config.linear.maxDelayMs
            );
          case 'fixed':
            return new FixedDelayStrategy(
              config.fixed.delayMs,
              config.fixed.maxAttempts
            );
          default:
            throw new Error(`Unknown strategy: ${config.defaultStrategy}`);
        }
      }
      
      private async callClaudeAPI(templateId: string, parameters: Record<string, any>): Promise<Conversation> {
        // Claude API integration (implementation in next prompt)
        throw new Error('Not implemented yet');
      }
    }
    ```

**ACCEPTANCE CRITERIA:**

**Functional:**
- [ ] Exponential backoff calculates delays correctly with jitter
- [ ] Linear backoff increments delays linearly
- [ ] Fixed delay uses constant delay between retries
- [ ] Error classifier correctly identifies retryable vs non-retryable errors
- [ ] Max retry attempts enforced (default 3)
- [ ] Max backoff delay enforced (5 minutes cap)
- [ ] Settings UI allows configuration of retry strategy
- [ ] Retry simulation accurately demonstrates behavior
- [ ] Failed items after max retries marked with detailed error information

**Technical:**
- [ ] All retry strategies implement `RetryStrategy` interface
- [ ] Error classifier has unit tests for all error types
- [ ] Retry executor logs all attempts to database
- [ ] Retry metrics captured: attempt count, total time, success/failure
- [ ] Configuration persisted in user preferences or database
- [ ] Thread-safe retry execution (no race conditions)

**Performance:**
- [ ] Retry delay calculation completes in <1ms
- [ ] Error classification completes in <5ms
- [ ] No performance degradation with multiple concurrent retries

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
```
src/lib/ai/
  ├── retry-strategy.ts        # Strategy interface and implementations
  ├── error-classifier.ts      # Error categorization logic
  ├── retry-executor.ts        # Retry execution engine
  └── generation-client.ts     # Integration with rate limiter and retries

train-wireframe/src/components/views/
  └── SettingsView.tsx         # Enhanced with retry config
```

**Data Models:**

```typescript
// src/lib/ai/types.ts
export interface RetryMetrics {
  requestId: string;
  totalAttempts: number;
  successfulAttempt: number | null; // null if all failed
  totalDurationMs: number;
  delays: number[]; // Delay before each retry
  errors: string[]; // Error messages for each attempt
}

export interface RetryConfig {
  strategy: 'exponential' | 'linear' | 'fixed';
  maxAttempts: number;
  baseDelayMs?: number; // For exponential/linear
  incrementMs?: number; // For linear
  fixedDelayMs?: number; // For fixed
  maxDelayMs: number;
  jitterFactor?: number; // For exponential
  continueOnError: boolean;
}
```

**Error Handling:**
- Network errors: Retry with exponential backoff
- Rate limit errors (429): Retry with backoff + rate limiter pause
- Server errors (5xx): Retry with exponential backoff
- Client errors (4xx): Don't retry, log and fail immediately
- Validation errors: Don't retry, provide clear user feedback
- Timeout errors: Retry with increased timeout

**Testing Requirements:**

1. **Unit Tests** (`src/lib/ai/__tests__/retry-strategy.test.ts`):
   ```typescript
   describe('ExponentialBackoffStrategy', () => {
     test('calculates exponential delays correctly', () => {
       const strategy = new ExponentialBackoffStrategy(1000, 3);
       expect(strategy.calculateDelay(0)).toBeCloseTo(1000, -2);
       expect(strategy.calculateDelay(1)).toBeCloseTo(2000, -2);
       expect(strategy.calculateDelay(2)).toBeCloseTo(4000, -2);
     });
     
     test('adds random jitter to delays', () => {
       const strategy = new ExponentialBackoffStrategy(1000, 3, 300000, 0.1);
       const delays = [
         strategy.calculateDelay(1),
         strategy.calculateDelay(1),
         strategy.calculateDelay(1),
       ];
       // All delays should be different due to jitter
       expect(new Set(delays).size).toBe(3);
     });
     
     test('respects max delay cap', () => {
       const strategy = new ExponentialBackoffStrategy(1000, 10, 10000);
       expect(strategy.calculateDelay(20)).toBeLessThanOrEqual(10000);
     });
   });
   
   describe('ErrorClassifier', () => {
     test('identifies rate limit errors as retryable', () => {
       const error = new Error('429 Rate limit exceeded');
       expect(ErrorClassifier.isRetryable(error)).toBe(true);
     });
     
     test('identifies validation errors as non-retryable', () => {
       const error = new Error('400 Invalid request parameters');
       expect(ErrorClassifier.isRetryable(error)).toBe(false);
     });
   });
   ```

2. **Integration Tests** (`src/lib/ai/__tests__/retry-executor.test.ts`):
   ```typescript
   describe('RetryExecutor', () => {
     test('retries on transient failures', async () => {
       let attempts = 0;
       const fn = async () => {
         attempts++;
         if (attempts < 3) throw new Error('500 Server Error');
         return 'success';
       };
       
       const strategy = new ExponentialBackoffStrategy(100, 5);
       const executor = new RetryExecutor(strategy);
       
       const result = await executor.execute(fn, { requestId: 'test' });
       expect(result).toBe('success');
       expect(attempts).toBe(3);
     });
     
     test('fails after max attempts', async () => {
       const fn = async () => { throw new Error('500 Server Error'); };
       
       const strategy = new ExponentialBackoffStrategy(100, 3);
       const executor = new RetryExecutor(strategy);
       
       await expect(executor.execute(fn, { requestId: 'test' }))
         .rejects.toThrow('500 Server Error');
     });
   });
   ```

3. **Manual Testing Checklist:**
   - [ ] Configure exponential backoff in Settings
   - [ ] Trigger retry simulation with 50% failure rate
   - [ ] Observe delays increasing exponentially
   - [ ] Verify max attempts enforced
   - [ ] Test with different strategies (linear, fixed)
   - [ ] Simulate network failure and verify retry behavior

**VALIDATION REQUIREMENTS:**

1. **Functional Validation:**
   - Trigger generation with simulated API failures
   - Verify retries execute with correct delays
   - Confirm max attempts enforced
   - Validate error classification accuracy

2. **Performance Validation:**
   - Measure retry overhead (<10ms per retry)
   - Verify no memory leaks with multiple retries
   - Test concurrent retries (50 simultaneous)

3. **Integration Validation:**
   - Integration with rate limiter from Prompt 1
   - Retry metrics logged to generation_logs table
   - Settings configuration persisted correctly

**DELIVERABLES:**

**New Files:**
- `src/lib/ai/retry-strategy.ts` (200-250 lines)
- `src/lib/ai/error-classifier.ts` (100-150 lines)
- `src/lib/ai/retry-executor.ts` (150-200 lines)
- `src/lib/ai/generation-client.ts` (200-250 lines)

**Modified Files:**
- `src/lib/ai-config.ts` (add retry configuration)
- `train-wireframe/src/components/views/SettingsView.tsx` (add retry config UI)

**Tests:**
- `src/lib/ai/__tests__/retry-strategy.test.ts`
- `src/lib/ai/__tests__/error-classifier.test.ts`
- `src/lib/ai/__tests__/retry-executor.test.ts`

**Documentation:**
- JSDoc comments for all public methods
- README section on retry strategies

Implement this feature completely, ensuring robust error handling and clear user feedback for all failure scenarios.


++++++++++++++++++


### Prompt 3: Template Management System - CRUD Operations
**Scope**: Implement complete template lifecycle management including CRUD operations, versioning, and UI components  
**Dependencies**: Database schema (E02 SQL setup), basic UI patterns from E01  
**Estimated Time**: 14-16 hours  
**Risk Level**: Low (standard CRUD operations)

========================

You are a senior full-stack developer implementing the prompt template management system for the Interactive LoRA Conversation Generation platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The template management system enables users to create, edit, test, and manage conversation prompt templates. These templates form the foundation for all conversation generation workflows across three tiers (Template, Scenario, Edge Case). This system must support versioning, usage tracking, and quality thresholds.

**Functional Requirements Being Implemented:**
- **FR2.2.1: Template Storage and Version Control** - Database-backed prompt template management with version history
  - Template entity with all required fields (name, structure, variables, tier, etc.)
  - Template structure supports {{variable}} placeholder syntax
  - Variables array defines type, default value, help text, options for dropdowns
  - Template management UI accessible from TemplatesView component
  - List view supports sorting by name, usage count, rating, last modified
  - Template editor highlights placeholders with syntax validation
  - Preview pane resolves placeholders with sample values
  - Version history shows diffs using text-diff algorithm
  - Active/inactive status controls template availability
  - Usage count increments on each template application
  - Template deletion requires confirmation and checks dependencies

**CURRENT CODEBASE STATE:**

**Database Schema (from E02 SQL):**
```sql
-- prompt_templates table already created with:
-- id, template_name, version, template_text, template_type, tier,
-- variables (JSONB), required_parameters, applicable_personas,
-- applicable_emotions, description, style_notes, example_conversation,
-- quality_threshold, is_active, usage_count, rating,
-- created_at, updated_at, created_by
```

**Existing Type Definitions (train-wireframe/src/lib/types.ts:58-82):**
```typescript
export type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  structure: string; // Template text with {{placeholders}}
  variables: TemplateVariable[];
  tone: string;
  complexityBaseline: number;
  styleNotes?: string;
  exampleConversation?: string;
  qualityThreshold: number;
  requiredElements: string[];
  usageCount: number;
  rating: number;
  lastModified: string;
  createdBy: string;
};

export type TemplateVariable = {
  name: string;
  type: 'text' | 'number' | 'dropdown';
  defaultValue: string;
  helpText?: string;
  options?: string[]; // For dropdown type
};
```

**Existing UI Component (train-wireframe/src/components/views/TemplatesView.tsx):**
Currently a stub component that needs full implementation.

**IMPLEMENTATION TASKS:**

**Task T-2.3.1: Template API Endpoints**

1. **Create Template Service** (`src/lib/template-service.ts`):
   ```typescript
   export class TemplateService {
     private supabase: SupabaseClient;
     
     constructor(supabaseClient: SupabaseClient) {
       this.supabase = supabaseClient;
     }
     
     async getAllTemplates(filters?: {
       tier?: string;
       isActive?: boolean;
       sortBy?: 'name' | 'usageCount' | 'rating' | 'lastModified';
       sortOrder?: 'asc' | 'desc';
     }): Promise<Template[]> {
       let query = this.supabase
         .from('prompt_templates')
         .select('*');
       
       if (filters?.tier) {
         query = query.eq('tier', filters.tier);
       }
       
       if (filters?.isActive !== undefined) {
         query = query.eq('is_active', filters.isActive);
       }
       
       if (filters?.sortBy) {
         const column = this.mapSortColumn(filters.sortBy);
         query = query.order(column, { ascending: filters.sortOrder === 'asc' });
       }
       
       const { data, error } = await query;
       
       if (error) throw new Error(`Failed to fetch templates: ${error.message}`);
       
       return this.mapToTemplateType(data);
     }
     
     async getTemplateById(id: string): Promise<Template | null> {
       const { data, error } = await this.supabase
         .from('prompt_templates')
         .select('*')
         .eq('id', id)
         .single();
       
       if (error) {
         if (error.code === 'PGRST116') return null; // Not found
         throw new Error(`Failed to fetch template: ${error.message}`);
       }
       
       return this.mapToTemplateType([data])[0];
     }
     
     async createTemplate(template: Omit<Template, 'id' | 'usageCount' | 'lastModified'>): Promise<Template> {
       const dbTemplate = this.mapToDbSchema(template);
       
       const { data, error } = await this.supabase
         .from('prompt_templates')
         .insert(dbTemplate)
         .select()
         .single();
       
       if (error) throw new Error(`Failed to create template: ${error.message}`);
       
       return this.mapToTemplateType([data])[0];
     }
     
     async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
       const dbUpdates = this.mapToDbSchema(updates);
       
       const { data, error } = await this.supabase
         .from('prompt_templates')
         .update(dbUpdates)
         .eq('id', id)
         .select()
         .single();
       
       if (error) throw new Error(`Failed to update template: ${error.message}`);
       
       return this.mapToTemplateType([data])[0];
     }
     
     async deleteTemplate(id: string): Promise<void> {
       // Check for dependencies (conversations using this template)
       const { count, error: countError } = await this.supabase
         .from('conversations')
         .select('*', { count: 'exact', head: true })
         .eq('parent_id', id)
         .eq('parent_type', 'template');
       
       if (countError) throw new Error(`Failed to check dependencies: ${countError.message}`);
       
       if (count && count > 0) {
         throw new Error(`Cannot delete template: ${count} conversations depend on it. Archive instead.`);
       }
       
       const { error } = await this.supabase
         .from('prompt_templates')
         .delete()
         .eq('id', id);
       
       if (error) throw new Error(`Failed to delete template: ${error.message}`);
     }
     
     async incrementUsageCount(id: string): Promise<void> {
       const { error } = await this.supabase
         .rpc('increment_template_usage', { template_id: id });
       
       if (error) throw new Error(`Failed to increment usage: ${error.message}`);
     }
     
     private mapSortColumn(sortBy: string): string {
       const mapping: Record<string, string> = {
         name: 'template_name',
         usageCount: 'usage_count',
         rating: 'rating',
         lastModified: 'updated_at',
       };
       return mapping[sortBy] || 'created_at';
     }
     
     private mapToTemplateType(dbData: any[]): Template[] {
       // Map database schema to Template type
     }
     
     private mapToDbSchema(template: Partial<Template>): any {
       // Map Template type to database schema
     }
   }
   ```

2. **Create API Routes**:
   
   **GET /api/templates/route.ts:**
   ```typescript
   export async function GET(request: Request) {
     const { searchParams } = new URL(request.url);
     const tier = searchParams.get('tier');
     const isActive = searchParams.get('isActive') === 'true';
     const sortBy = searchParams.get('sortBy') || 'name';
     const sortOrder = searchParams.get('sortOrder') || 'asc';
     
     const supabase = createClient();
     const templateService = new TemplateService(supabase);
     
     try {
       const templates = await templateService.getAllTemplates({
         tier: tier || undefined,
         isActive: isActive,
         sortBy: sortBy as any,
         sortOrder: sortOrder as any,
       });
       
       return Response.json({ templates });
     } catch (error) {
       return Response.json(
         { error: error.message },
         { status: 500 }
       );
     }
   }
   ```
   
   **POST /api/templates/route.ts:**
   ```typescript
   export async function POST(request: Request) {
     const body = await request.json();
     
     // Validate required fields
     if (!body.name || !body.structure) {
       return Response.json(
         { error: 'Missing required fields: name, structure' },
         { status: 400 }
       );
     }
     
     const supabase = createClient();
     const templateService = new TemplateService(supabase);
     
     try {
       const template = await templateService.createTemplate(body);
       return Response.json({ template }, { status: 201 });
     } catch (error) {
       return Response.json(
         { error: error.message },
         { status: 500 }
       );
     }
   }
   ```
   
   **GET /api/templates/[id]/route.ts:**
   ```typescript
   export async function GET(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     const supabase = createClient();
     const templateService = new TemplateService(supabase);
     
     try {
       const template = await templateService.getTemplateById(params.id);
       
       if (!template) {
         return Response.json(
           { error: 'Template not found' },
           { status: 404 }
         );
       }
       
       return Response.json({ template });
     } catch (error) {
       return Response.json(
         { error: error.message },
         { status: 500 }
       );
     }
   }
   ```
   
   **PATCH /api/templates/[id]/route.ts:**
   ```typescript
   export async function PATCH(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     const body = await request.json();
     
     const supabase = createClient();
     const templateService = new TemplateService(supabase);
     
     try {
       const template = await templateService.updateTemplate(params.id, body);
       return Response.json({ template });
     } catch (error) {
       return Response.json(
         { error: error.message },
         { status: 500 }
       );
     }
   }
   ```
   
   **DELETE /api/templates/[id]/route.ts:**
   ```typescript
   export async function DELETE(
     request: Request,
     { params }: { params: { id: string } }
   ) {
     const supabase = createClient();
     const templateService = new TemplateService(supabase);
     
     try {
       await templateService.deleteTemplate(params.id);
       return Response.json({ success: true });
     } catch (error) {
       if (error.message.includes('conversations depend')) {
         return Response.json(
           { error: error.message, canArchive: true },
           { status: 409 }
         );
       }
       return Response.json(
         { error: error.message },
         { status: 500 }
       );
     }
   }
   ```

3. **Add Database Function for Usage Increment**:
   ```sql
   CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
   RETURNS VOID AS $$
   BEGIN
     UPDATE prompt_templates
     SET usage_count = usage_count + 1,
         updated_at = NOW()
     WHERE id = template_id;
   END;
   $$ LANGUAGE plpgsql;
   ```

**Task T-2.3.2: Template Editor Component**

4. **Implement TemplatesView** (`train-wireframe/src/components/views/TemplatesView.tsx`):
   ```typescript
   export const TemplatesView: React.FC = () => {
     const [templates, setTemplates] = useState<Template[]>([]);
     const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
     const [isEditorOpen, setIsEditorOpen] = useState(false);
     const [sortConfig, setSortConfig] = useState({ sortBy: 'name', sortOrder: 'asc' });
     
     useEffect(() => {
       fetchTemplates();
     }, [sortConfig]);
     
     const fetchTemplates = async () => {
       const response = await fetch(
         `/api/templates?sortBy=${sortConfig.sortBy}&sortOrder=${sortConfig.sortOrder}`
       );
       const data = await response.json();
       setTemplates(data.templates);
     };
     
     const handleCreateTemplate = () => {
       setSelectedTemplate(null);
       setIsEditorOpen(true);
     };
     
     const handleEditTemplate = (template: Template) => {
       setSelectedTemplate(template);
       setIsEditorOpen(true);
     };
     
     const handleDeleteTemplate = async (id: string) => {
       if (!confirm('Are you sure you want to delete this template?')) return;
       
       const response = await fetch(`/api/templates/${id}`, {
         method: 'DELETE',
       });
       
       if (response.ok) {
         fetchTemplates();
         toast.success('Template deleted successfully');
       } else {
         const { error } = await response.json();
         toast.error(error);
       }
     };
     
     return (
       <div className="p-6">
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-2xl font-bold">Prompt Templates</h1>
           <Button onClick={handleCreateTemplate}>
             <Plus className="w-4 h-4 mr-2" />
             Create Template
           </Button>
         </div>
         
         <TemplateTable
           templates={templates}
           sortConfig={sortConfig}
           onSort={setSortConfig}
           onEdit={handleEditTemplate}
           onDelete={handleDeleteTemplate}
         />
         
         {isEditorOpen && (
           <TemplateEditorModal
             template={selectedTemplate}
             onClose={() => setIsEditorOpen(false)}
             onSave={async (template) => {
               await saveTemplate(template);
               setIsEditorOpen(false);
               fetchTemplates();
             }}
           />
         )}
       </div>
     );
   };
   ```

5. **Create TemplateTable Component**:
   ```typescript
   interface TemplateTableProps {
     templates: Template[];
     sortConfig: { sortBy: string; sortOrder: string };
     onSort: (config: any) => void;
     onEdit: (template: Template) => void;
     onDelete: (id: string) => void;
   }
   
   export const TemplateTable: React.FC<TemplateTableProps> = ({
     templates,
     sortConfig,
     onSort,
     onEdit,
     onDelete,
   }) => {
     const handleSort = (column: string) => {
       const newOrder = 
         sortConfig.sortBy === column && sortConfig.sortOrder === 'asc'
           ? 'desc'
           : 'asc';
       onSort({ sortBy: column, sortOrder: newOrder });
     };
     
     return (
       <Table>
         <TableHeader>
           <TableRow>
             <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
               Name {sortConfig.sortBy === 'name' && (
                 sortConfig.sortOrder === 'asc' ? '↑' : '↓'
               )}
             </TableHead>
             <TableHead>Tier</TableHead>
             <TableHead onClick={() => handleSort('usageCount')} className="cursor-pointer">
               Usage {sortConfig.sortBy === 'usageCount' && (
                 sortConfig.sortOrder === 'asc' ? '↑' : '↓'
               )}
             </TableHead>
             <TableHead onClick={() => handleSort('rating')} className="cursor-pointer">
               Rating {sortConfig.sortBy === 'rating' && (
                 sortConfig.sortOrder === 'asc' ? '↑' : '↓'
               )}
             </TableHead>
             <TableHead>Status</TableHead>
             <TableHead>Actions</TableHead>
           </TableRow>
         </TableHeader>
         <TableBody>
           {templates.map((template) => (
             <TableRow key={template.id}>
               <TableCell className="font-medium">{template.name}</TableCell>
               <TableCell>
                 <Badge variant={template.tier === 'template' ? 'default' : 'secondary'}>
                   {template.tier}
                 </Badge>
               </TableCell>
               <TableCell>{template.usageCount}</TableCell>
               <TableCell>
                 {template.rating ? template.rating.toFixed(1) : 'N/A'}
               </TableCell>
               <TableCell>
                 <Badge variant={template.isActive ? 'success' : 'secondary'}>
                   {template.isActive ? 'Active' : 'Inactive'}
                 </Badge>
               </TableCell>
               <TableCell>
                 <DropdownMenu>
                   <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="sm">
                       <MoreVertical className="w-4 h-4" />
                     </Button>
                   </DropdownMenuTrigger>
                   <DropdownMenuContent>
                     <DropdownMenuItem onClick={() => onEdit(template)}>
                       Edit
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={() => onDelete(template.id)}>
                       Delete
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                 </DropdownMenu>
               </TableCell>
             </TableRow>
           ))}
         </TableBody>
       </Table>
     );
   };
   ```

6. **Create TemplateEditorModal Component**:
   ```typescript
   interface TemplateEditorModalProps {
     template: Template | null;
     onClose: () => void;
     onSave: (template: Partial<Template>) => Promise<void>;
   }
   
   export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
     template,
     onClose,
     onSave,
   }) => {
     const [formData, setFormData] = useState({
       name: template?.name || '',
       description: template?.description || '',
       structure: template?.structure || '',
       tier: template?.tier || 'template',
       variables: template?.variables || [],
       qualityThreshold: template?.qualityThreshold || 0.7,
       isActive: template?.isActive ?? true,
     });
     
     const [previewMode, setPreviewMode] = useState(false);
     const [sampleValues, setSampleValues] = useState<Record<string, any>>({});
     
     const handleSubmit = async (e: React.FormEvent) => {
       e.preventDefault();
       
       const templateData = {
         ...formData,
         id: template?.id,
       };
       
       await onSave(templateData);
     };
     
     const resolveTemplate = (structure: string, values: Record<string, any>): string => {
       let resolved = structure;
       Object.entries(values).forEach(([key, value]) => {
         resolved = resolved.replace(new RegExp(`{{${key}}}`, 'g'), value);
       });
       return resolved;
     };
     
     return (
       <Dialog open onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>
               {template ? 'Edit Template' : 'Create Template'}
             </DialogTitle>
           </DialogHeader>
           
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="name">Template Name</Label>
                 <Input
                   id="name"
                   value={formData.name}
                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                   required
                 />
               </div>
               
               <div>
                 <Label htmlFor="tier">Tier</Label>
                 <Select
                   value={formData.tier}
                   onValueChange={(value) => setFormData({ ...formData, tier: value })}
                 >
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="template">Template</SelectItem>
                     <SelectItem value="scenario">Scenario</SelectItem>
                     <SelectItem value="edge_case">Edge Case</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             
             <div>
               <Label htmlFor="description">Description</Label>
               <Textarea
                 id="description"
                 value={formData.description}
                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 rows={2}
               />
             </div>
             
             <div>
               <div className="flex justify-between items-center mb-2">
                 <Label htmlFor="structure">Template Structure</Label>
                 <Button
                   type="button"
                   variant="outline"
                   size="sm"
                   onClick={() => setPreviewMode(!previewMode)}
                 >
                   {previewMode ? 'Edit' : 'Preview'}
                 </Button>
               </div>
               
               {previewMode ? (
                 <div className="border rounded p-4 bg-muted min-h-[200px]">
                   <p className="whitespace-pre-wrap">
                     {resolveTemplate(formData.structure, sampleValues)}
                   </p>
                 </div>
               ) : (
                 <Textarea
                   id="structure"
                   value={formData.structure}
                   onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                   rows={10}
                   placeholder="Enter your template with {{placeholders}}..."
                   className="font-mono"
                   required
                 />
               )}
             </div>
             
             <div>
               <Label>Variables</Label>
               <TemplateVariableEditor
                 variables={formData.variables}
                 onChange={(variables) => setFormData({ ...formData, variables })}
                 onSampleValuesChange={setSampleValues}
               />
             </div>
             
             <div className="flex items-center space-x-2">
               <Checkbox
                 id="isActive"
                 checked={formData.isActive}
                 onCheckedChange={(checked) => 
                   setFormData({ ...formData, isActive: checked as boolean })
                 }
               />
               <Label htmlFor="isActive">Active (available for generation)</Label>
             </div>
             
             <DialogFooter>
               <Button type="button" variant="outline" onClick={onClose}>
                 Cancel
               </Button>
               <Button type="submit">
                 {template ? 'Update' : 'Create'} Template
               </Button>
             </DialogFooter>
           </form>
         </DialogContent>
       </Dialog>
     );
   };
   ```

7. **Create TemplateVariableEditor Component**:
   ```typescript
   interface TemplateVariableEditorProps {
     variables: TemplateVariable[];
     onChange: (variables: TemplateVariable[]) => void;
     onSampleValuesChange: (values: Record<string, any>) => void;
   }
   
   export const TemplateVariableEditor: React.FC<TemplateVariableEditorProps> = ({
     variables,
     onChange,
     onSampleValuesChange,
   }) => {
     const handleAddVariable = () => {
       const newVariable: TemplateVariable = {
         name: '',
         type: 'text',
         defaultValue: '',
         helpText: '',
       };
       onChange([...variables, newVariable]);
     };
     
     const handleRemoveVariable = (index: number) => {
       onChange(variables.filter((_, i) => i !== index));
     };
     
     const handleUpdateVariable = (index: number, updates: Partial<TemplateVariable>) => {
       const updated = [...variables];
       updated[index] = { ...updated[index], ...updates };
       onChange(updated);
       
       // Update sample values
       const sampleValues: Record<string, any> = {};
       updated.forEach(v => {
         sampleValues[v.name] = v.defaultValue || `[${v.name}]`;
       });
       onSampleValuesChange(sampleValues);
     };
     
     return (
       <div className="space-y-2">
         {variables.map((variable, index) => (
           <div key={index} className="border rounded p-3 space-y-2">
             <div className="grid grid-cols-3 gap-2">
               <Input
                 placeholder="Variable name"
                 value={variable.name}
                 onChange={(e) => handleUpdateVariable(index, { name: e.target.value })}
               />
               <Select
                 value={variable.type}
                 onValueChange={(value) => handleUpdateVariable(index, { type: value as any })}
               >
                 <SelectTrigger>
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="text">Text</SelectItem>
                   <SelectItem value="number">Number</SelectItem>
                   <SelectItem value="dropdown">Dropdown</SelectItem>
                 </SelectContent>
               </Select>
               <Button
                 type="button"
                 variant="ghost"
                 size="sm"
                 onClick={() => handleRemoveVariable(index)}
               >
                 <X className="w-4 h-4" />
               </Button>
             </div>
             
             <Input
               placeholder="Default value"
               value={variable.defaultValue}
               onChange={(e) => handleUpdateVariable(index, { defaultValue: e.target.value })}
             />
             
             <Input
               placeholder="Help text (optional)"
               value={variable.helpText || ''}
               onChange={(e) => handleUpdateVariable(index, { helpText: e.target.value })}
             />
             
             {variable.type === 'dropdown' && (
               <Input
                 placeholder="Options (comma-separated)"
                 value={variable.options?.join(', ') || ''}
                 onChange={(e) => handleUpdateVariable(index, { 
                   options: e.target.value.split(',').map(s => s.trim()) 
                 })}
               />
             )}
           </div>
         ))}
         
         <Button
           type="button"
           variant="outline"
           size="sm"
           onClick={handleAddVariable}
         >
           <Plus className="w-4 h-4 mr-2" />
           Add Variable
         </Button>
       </div>
     );
   };
   ```

**ACCEPTANCE CRITERIA:**

**Functional:**
- [ ] Template list displays all templates with sorting
- [ ] Create template saves to database with validation
- [ ] Edit template updates existing template
- [ ] Delete template checks dependencies before deletion
- [ ] Template editor highlights {{placeholders}} in structure
- [ ] Preview pane resolves placeholders with sample values
- [ ] Variable editor allows adding/removing/editing variables
- [ ] Active/inactive toggle controls template availability
- [ ] API endpoints return proper error messages

**Technical:**
- [ ] All CRUD operations follow established service layer pattern
- [ ] Type safety maintained across API and UI
- [ ] Database transactions for atomic operations
- [ ] RLS policies enforced on all queries
- [ ] Error handling with user-friendly messages
- [ ] Loading states during API calls

**Performance:**
- [ ] Template list loads in <500ms for 100 templates
- [ ] Template editor responsive with large templates (>1000 chars)
- [ ] Preview updates without lag (<100ms)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
```
src/lib/
  └── template-service.ts          # Template CRUD service

src/app/api/templates/
  ├── route.ts                     # GET all, POST create
  └── [id]/route.ts                # GET, PATCH, DELETE by ID

train-wireframe/src/components/views/
  └── TemplatesView.tsx            # Main template management UI

train-wireframe/src/components/templates/
  ├── TemplateTable.tsx            # Template list table
  ├── TemplateEditorModal.tsx     # Template editor dialog
  └── TemplateVariableEditor.tsx  # Variable configuration UI
```

**Data Models:**

```typescript
// API Request/Response types
export interface CreateTemplateRequest {
  name: string;
  description?: string;
  structure: string;
  tier: 'template' | 'scenario' | 'edge_case';
  variables: TemplateVariable[];
  qualityThreshold?: number;
  isActive?: boolean;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  structure?: string;
  variables?: TemplateVariable[];
  qualityThreshold?: number;
  isActive?: boolean;
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
}
```

**Error Handling:**
- Missing required fields: 400 Bad Request
- Template not found: 404 Not Found
- Dependency conflict on delete: 409 Conflict
- Database errors: 500 Internal Server Error
- Validation errors: Clear user-facing messages in toast

**Testing Requirements:**

1. **Unit Tests** (`src/lib/__tests__/template-service.test.ts`):
   - Test CRUD operations
   - Test dependency checking
   - Test error handling

2. **Integration Tests** (`src/app/api/templates/__tests__/route.test.ts`):
   - Test all API endpoints
   - Test RLS policies
   - Test validation

3. **Manual Testing Checklist:**
   - [ ] Create template with variables
   - [ ] Edit template and verify changes saved
   - [ ] Test preview with different variable values
   - [ ] Delete template and verify dependency check
   - [ ] Sort templates by different columns
   - [ ] Toggle active/inactive status

**VALIDATION REQUIREMENTS:**

1. **Functional Validation:**
   - Create 5 templates across all tiers
   - Verify templates appear in sorted list
   - Test preview with complex placeholders
   - Confirm deletion blocked for templates with dependencies

2. **Data Integrity Validation:**
   - Verify RLS policies prevent unauthorized access
   - Confirm database constraints enforced
   - Test concurrent updates (no data loss)

3. **UI/UX Validation:**
   - Template editor responsive and intuitive
   - Loading states displayed during operations
   - Error messages clear and actionable
   - Preview accurately reflects template structure

**DELIVERABLES:**

**New Files:**
- `src/lib/template-service.ts` (300-400 lines)
- `src/app/api/templates/route.ts` (100-150 lines)
- `src/app/api/templates/[id]/route.ts` (150-200 lines)
- `train-wireframe/src/components/templates/TemplateTable.tsx` (150-200 lines)
- `train-wireframe/src/components/templates/TemplateEditorModal.tsx` (300-400 lines)
- `train-wireframe/src/components/templates/TemplateVariableEditor.tsx` (150-200 lines)

**Modified Files:**
- `train-wireframe/src/components/views/TemplatesView.tsx` (full implementation)

**Tests:**
- `src/lib/__tests__/template-service.test.ts`
- `src/app/api/templates/__tests__/route.test.ts`

**Documentation:**
- JSDoc comments for all public methods
- README for template management workflow

Implement this feature completely, ensuring intuitive UI and robust data management.


++++++++++++++++++


### Prompt 4: Parameter Injection Engine & Security
**Scope**: Implement template parameter resolution with security escaping and validation  
**Dependencies**: Prompt 3 (templates must exist)  
**Estimated Time**: 12-14 hours  
**Risk Level**: High (security vulnerabilities)

========================

You are a senior backend developer implementing the parameter injection engine for the AI Integration platform, with special focus on security and data validation.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The parameter injection engine resolves template placeholders ({{variableName}}) with actual values from conversation metadata. This is a **critical security component** as malicious template parameters could lead to injection attacks, XSS vulnerabilities, or unintended API behavior.

**Functional Requirements Being Implemented:**
- **FR2.2.2: Automatic Parameter Injection** - Dynamic parameter substitution with validation
  - Parameters automatically populated from conversation metadata before API call
  - Pre-generation validation ensuring all required parameters present
  - Preview mode shows resolved template before generation
  - HTML special characters escaped to prevent injection attacks
  - Parameter values type-coerced appropriately
  - Default values applied when optional parameters missing

**CURRENT CODEBASE STATE:**

From Prompt 3:
- Templates with variables defined in database
- Template type definitions in `train-wireframe/src/lib/types.ts`
- Template service for CRUD operations

**IMPLEMENTATION TASKS:**

1. **Create Parameter Injection Service** (`src/lib/ai/parameter-injection.ts`):
   - Template parser detecting {{placeholders}}
   - Parameter resolver with type validation
   - HTML escape handler for security
   - Conditional expression evaluator ({{persona ? 'text' : 'alt'}})
   - Required parameter validation

2. **Create Parameter Validation** (`src/lib/ai/parameter-validation.ts`):
   - Type checking for text, number, dropdown
   - Required vs optional parameter validation
   - Range validation for numbers
   - Enum validation for dropdowns

3. **Integrate with SingleGenerationForm** (`train-wireframe/src/components/generation/SingleGenerationForm.tsx`):
   - Parameter input fields based on template variables
   - Real-time preview of resolved template
   - Validation error display
   - Sample value auto-fill

4. **Security Implementation**:
   - HTML escape: &, <, >, ", '
   - SQL injection prevention (parameterized queries only)
   - Template injection prevention (no eval, no dynamic code execution)
   - XSS protection (CSP headers, escaped output)

**SECURITY TESTING REQUIREMENTS**:
- Test with malicious inputs: `<script>alert('xss')</script>`
- Test SQL injection: `'; DROP TABLE users;--`
- Test template injection: `{{__import__('os').system('rm -rf /')}}`
- All must be safely escaped/blocked

**ACCEPTANCE CRITERIA:**

**Functional:**
- [ ] Placeholders correctly resolved with parameter values
- [ ] Required parameters validated before generation
- [ ] Missing parameter error messages clear and specific
- [ ] Preview shows fully resolved template
- [ ] Conditional expressions evaluated correctly
- [ ] Default values applied for optional parameters

**Security:**
- [ ] All HTML special characters escaped
- [ ] No XSS vulnerabilities in preview or generation
- [ ] No template injection possible
- [ ] Input validation prevents malicious content
- [ ] Security audit passed

**Performance:**
- [ ] Parameter resolution <50ms for 10 variables
- [ ] Validation <20ms
- [ ] Preview updates without lag

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
```
src/lib/ai/
  ├── parameter-injection.ts     # Core injection logic
  ├── parameter-validation.ts    # Validation rules
  └── security-utils.ts          # Escaping and sanitization
```

**Data Models:**

```typescript
export interface ResolvedTemplate {
  original: string;
  resolved: string;
  parameters: Record<string, any>;
  missingRequired: string[];
  errors: ParameterError[];
}

export interface ParameterError {
  parameterName: string;
  error: string;
  expectedType: string;
  actualValue: any;
}
```

**Security Measures:**
1. Input sanitization on all user-provided values
2. Output escaping for all rendered content
3. No dynamic code execution (no eval, no Function constructor)
4. Content Security Policy headers
5. Audit logging of all parameter injections

**DELIVERABLES:**

**New Files:**
- `src/lib/ai/parameter-injection.ts` (250-300 lines)
- `src/lib/ai/parameter-validation.ts` (150-200 lines)
- `src/lib/ai/security-utils.ts` (100-150 lines)

**Modified Files:**
- `train-wireframe/src/components/generation/SingleGenerationForm.tsx`

**Tests:**
- `src/lib/ai/__tests__/parameter-injection.test.ts`
- `src/lib/ai/__tests__/security.test.ts` (XSS, injection tests)

Implement this feature with security as the top priority. Every input must be validated and escaped.


++++++++++++++++++


### Prompt 5: Template Testing & Analytics System
**Scope**: Implement template testing framework and usage analytics dashboard  
**Dependencies**: Prompts 3, 4 (templates and injection)  
**Estimated Time**: 14-16 hours  
**Risk Level**: Medium (analytics performance)

========================

You are a senior full-stack developer implementing the template testing framework and analytics system.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The testing system enables users to validate templates before activation, comparing results against baselines. The analytics system tracks template performance to identify top performers and guide optimization efforts.

**Functional Requirements Being Implemented:**
- **FR2.2.3: Template Validation and Testing** - Test templates before activation
- **FR2.2.4: Template Usage Analytics** - Track template performance metrics

**IMPLEMENTATION TASKS:**

1. **Template Testing API** (`src/app/api/templates/test/route.ts`):
   - Execute template with test parameters
   - Call Claude API with resolved template
   - Validate response structure
   - Compare with baseline metrics
   - Return test results with quality score

2. **Template Testing UI** (`train-wireframe/src/components/templates/TemplateTestModal.tsx`):
   - Test dialog with parameter inputs
   - Auto-generate realistic test data
   - Live preview of resolved template
   - Execute test button with loading state
   - Results display with quality metrics
   - Pass/fail indicators

3. **Analytics Data Aggregation** (`src/app/api/templates/analytics/route.ts`):
   - Calculate usage statistics per template
   - Compute average quality scores
   - Calculate approval rates
   - Generate time-series trend data
   - Identify top performers per tier

4. **Analytics Dashboard** (`train-wireframe/src/components/templates/TemplateAnalyticsDashboard.tsx`):
   - Usage statistics table
   - Quality trend charts (Recharts)
   - Side-by-side comparison view
   - Top performer recommendations
   - CSV export functionality

**ACCEPTANCE CRITERIA:**

**Functional:**
- [ ] Template testing calls Claude API successfully
- [ ] Test results show quality breakdown
- [ ] Analytics calculate correct statistics
- [ ] Trend charts display historical data
- [ ] Recommendations identify top templates
- [ ] CSV export includes all metrics

**Technical:**
- [ ] Test API handles rate limiting gracefully
- [ ] Analytics queries optimized (<1s for 1000 templates)
- [ ] Charts render responsively
- [ ] Data refresh on navigation

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
```
src/app/api/templates/
  ├── test/route.ts                # Template testing endpoint
  └── analytics/route.ts           # Analytics aggregation

train-wireframe/src/components/templates/
  ├── TemplateTestModal.tsx        # Test dialog
  └── TemplateAnalyticsDashboard.tsx  # Analytics dashboard
```

**Data Models:**

```typescript
export interface TemplateTestResult {
  templateId: string;
  testParameters: Record<string, any>;
  resolvedTemplate: string;
  apiResponse: any;
  qualityScore: number;
  qualityBreakdown: QualityMetrics;
  passedTest: boolean;
  baselineComparison?: {
    avgQualityScore: number;
    deviation: number;
  };
}

export interface TemplateAnalytics {
  templateId: string;
  templateName: string;
  usageCount: number;
  avgQualityScore: number;
  approvalRate: number;
  tier: string;
  trend: 'improving' | 'stable' | 'declining';
}
```

**DELIVERABLES:**

**New Files:**
- `src/app/api/templates/test/route.ts` (150-200 lines)
- `src/app/api/templates/analytics/route.ts` (200-250 lines)
- `train-wireframe/src/components/templates/TemplateTestModal.tsx` (250-300 lines)
- `train-wireframe/src/components/templates/TemplateAnalyticsDashboard.tsx` (300-400 lines)

**Tests:**
- `src/app/api/templates/__tests__/test.test.ts`
- `src/app/api/templates/__tests__/analytics.test.ts`

Implement comprehensive analytics to drive template optimization decisions.


++++++++++++++++++


### Prompt 6: Quality Validation System
**Scope**: Implement automated quality scoring with detailed breakdown and recommendations  
**Dependencies**: Prompt 1 (for testing with real generation)  
**Estimated Time**: 14-16 hours  
**Risk Level**: High (scoring accuracy)

========================

You are a senior developer implementing the quality validation system for automated conversation scoring.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The quality validation system automatically assesses generated conversations, providing a 0-10 score based on multiple criteria (turn count, length, structure, confidence). This enables early identification of low-quality conversations and data-driven quality improvement.

**Functional Requirements Being Implemented:**
- **FR2.3.1: Automated Quality Scoring** - Calculate scores based on structural criteria
- **FR2.3.2: Quality Criteria Details** - Detailed breakdown with recommendations

**IMPLEMENTATION TASKS:**

1. **Quality Scoring Engine** (`src/lib/quality/scorer.ts`):
   - Turn count evaluator (optimal 8-16 turns)
   - Length evaluator (appropriate for tier)
   - Structure validator (JSON validity)
   - Confidence calculator (high/medium/low)
   - Weighted score aggregator

2. **Quality Breakdown Modal** (`train-wireframe/src/components/dashboard/QualityDetailsModal.tsx`):
   - Clickable quality scores in table
   - Modal with detailed breakdown
   - Progress bars for each criterion
   - Color-coded indicators
   - Specific recommendations per failure
   - Keyboard navigation support

3. **Auto-Flagging System** (`src/lib/quality/auto-flag.ts`):
   - Automatically flag conversations with score < 6
   - Update status to 'needs_revision'
   - Log flagging actions
   - Notification system

4. **Quality Metrics Integration**:
   - Calculate scores immediately after generation
   - Store in conversations table
   - Display in ConversationTable component
   - Filter by quality range

**ACCEPTANCE CRITERIA:**

**Functional:**
- [ ] Quality score calculated immediately after generation
- [ ] Score displayed with color coding (red/yellow/green)
- [ ] Breakdown modal shows all component scores
- [ ] Recommendations specific and actionable
- [ ] Auto-flagging updates conversation status
- [ ] Filter by quality range works correctly

**Technical:**
- [ ] Scoring algorithm validated against 100 human reviews
- [ ] 85%+ agreement with human judgment
- [ ] Score calculation <100ms
- [ ] Modal accessible (keyboard navigation, screen reader)

**TECHNICAL SPECIFICATIONS:**

**File Locations:**
```
src/lib/quality/
  ├── scorer.ts                  # Quality scoring engine
  ├── auto-flag.ts               # Auto-flagging logic
  └── recommendations.ts         # Recommendation generation

train-wireframe/src/components/dashboard/
  └── QualityDetailsModal.tsx    # Breakdown modal
```

**Data Models:**

```typescript
export interface QualityScore {
  overall: number; // 0-10
  breakdown: {
    turnCount: { score: number; actual: number; target: string };
    length: { score: number; actual: number; target: string };
    structure: { score: number; valid: boolean };
    confidence: { score: number; level: 'high' | 'medium' | 'low' };
  };
  recommendations: string[];
}
```

**Scoring Algorithm:**

```typescript
// Turn count scoring (weight: 0.30)
if (turnCount >= 8 && turnCount <= 16) score = 10;
else if (turnCount >= 6 && turnCount <= 20) score = 7;
else if (turnCount >= 4 && turnCount <= 24) score = 5;
else score = 3;

// Length scoring (weight: 0.25)
// Tier-specific ranges

// Structure scoring (weight: 0.25)
// JSON validity + required fields

// Confidence scoring (weight: 0.20)
// Based on coherence and naturalness
```

**DELIVERABLES:**

**New Files:**
- `src/lib/quality/scorer.ts` (250-300 lines)
- `src/lib/quality/auto-flag.ts` (100-150 lines)
- `src/lib/quality/recommendations.ts` (150-200 lines)
- `train-wireframe/src/components/dashboard/QualityDetailsModal.tsx` (250-300 lines)

**Modified Files:**
- `train-wireframe/src/components/dashboard/ConversationTable.tsx` (add quality display)
- `train-wireframe/src/components/dashboard/FilterBar.tsx` (add quality range filter)

**Tests:**
- `src/lib/quality/__tests__/scorer.test.ts`
- Validation dataset: 100 human-reviewed conversations

Implement scoring algorithm with focus on accuracy and alignment with human judgment.


++++++++++++++++++


---

## Quality Validation Checklist

### Post-Implementation Verification

**Per-Prompt Validation:**
- [ ] All TypeScript compilation errors resolved
- [ ] All ESLint warnings addressed  
- [ ] Unit tests passing for business logic
- [ ] Integration tests passing for API routes
- [ ] Manual testing completed with UI workflows
- [ ] Performance benchmarks met

**Cross-Prompt Integration Testing:**

1. **End-to-End Generation Flow:**
   - [ ] Create template with variables
   - [ ] Test template with sample data
   - [ ] Generate conversation using template
   - [ ] Verify rate limiting enforced
   - [ ] Confirm retry logic on simulated failure
   - [ ] Check quality score calculated
   - [ ] Verify template usage count incremented
   - [ ] Review analytics updated

2. **Security Validation:**
   - [ ] XSS attack prevention tested
   - [ ] SQL injection prevention verified
   - [ ] Template injection blocked
   - [ ] All user inputs sanitized
   - [ ] Output properly escaped

3. **Performance Validation:**
   - [ ] Rate limiter check <5ms
   - [ ] Retry delay calculation <1ms
   - [ ] Parameter injection <50ms
   - [ ] Quality scoring <100ms
   - [ ] Template list load <500ms
   - [ ] Analytics queries <1s

4. **Data Integrity:**
   - [ ] RLS policies enforced
   - [ ] Foreign key constraints working
   - [ ] Database transactions atomic
   - [ ] Audit logs complete

### Cross-Prompt Consistency

- [ ] Consistent naming conventions across all files
- [ ] Aligned TypeScript interfaces
- [ ] Compatible data models
- [ ] Integrated error handling patterns
- [ ] Unified UI/UX patterns

### Acceptance Gates

**Before Moving to E03:**
- [ ] All 6 prompts implemented completely
- [ ] All acceptance criteria met per prompt
- [ ] Integration testing passed
- [ ] Security audit passed
- [ ] Performance benchmarks achieved
- [ ] Documentation complete

---

## Next Segment Preparation

### Dependencies for E03 (Template Tier Generation)

**E03 Will Require:**
1. **Rate Limiting System** (Prompt 1): For managing batch generation API calls
2. **Retry Strategy** (Prompt 2): For handling generation failures gracefully
3. **Template Management** (Prompt 3): For accessing Tier 1 templates
4. **Parameter Injection** (Prompt 4): For resolving template placeholders
5. **Quality Validation** (Prompt 6): For scoring generated conversations

**Handoff Information:**

**Successfully Implemented:**
- ✅ Sliding window rate limiter tracking requests per minute
- ✅ Exponential backoff retry strategy with error classification
- ✅ Template CRUD operations with versioning
- ✅ Parameter injection engine with security escaping
- ✅ Template testing framework with baseline comparison
- ✅ Usage analytics dashboard with trend visualization
- ✅ Quality scoring engine with detailed breakdown

**Configuration Values:**
- Default rate limit: 50 requests/minute
- Retry max attempts: 3
- Exponential backoff base: 1000ms
- Quality threshold for auto-flag: 6.0
- Template quality threshold: 0.70 (70%)

**Known Limitations:**
- Rate limiter uses in-memory storage (upgrade to Redis for production scaling)
- Analytics aggregation not yet optimized for 10,000+ templates
- Template versioning UI not yet implemented (infrastructure ready)

**Testing Data:**
- 2 seed templates created in database (Template and Scenario tiers)
- Sample variables defined for each template
- Test data generation utilities available

**API Endpoints Ready:**
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `GET /api/templates/:id` - Get single template
- `PATCH /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/test` - Test template
- `GET /api/templates/analytics` - Get analytics
- `GET /api/ai/queue-status` - Rate limit status

**Database Tables:**
- `prompt_templates` - Template storage
- `generation_logs` - API call logging
- `template_analytics` - Performance metrics

**Environment Variables Needed:**
```
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Implementation Summary

**Total Estimated Time:** 80-100 hours  
**Total Prompts:** 6  
**Total New Files:** 35+  
**Total Lines of Code:** ~5,000-6,000

**Risk Management:**
- High-risk components (rate limiting, parameter injection, quality scoring) require extra testing
- Security audit mandatory before production deployment
- Performance monitoring essential for rate limiter and analytics

**Success Criteria:**
- All functional requirements met (FR2.1, FR2.2, FR2.3)
- No security vulnerabilities in security audit
- Performance benchmarks achieved
- Integration with E01 components verified
- Ready for E03 dependency

**Next Steps:**
1. Execute database setup SQL
2. Implement Prompts 1-6 sequentially
3. Run integration tests after each prompt
4. Complete security audit after Prompt 4
5. Validate all acceptance criteria
6. Handoff to E03 development

---

**Document Version:** 1.0  
**Generated:** 2025-01-29  
**Last Updated:** 2025-01-29  
**Status:** Ready for Implementation

