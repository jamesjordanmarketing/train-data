# Failed Generation Storage & Visibility System - Implementation Execution Plan

**Generated**: 2025-12-02  
**Purpose**: Implement truncation detection and failed generation reporting system  
**Total Prompts**: 3  
**Estimated Implementation Time**: 18-24 hours  
**Priority**: CRITICAL - Blocking production data quality

---

## Executive Summary

This execution plan implements a comprehensive system for detecting, storing, and analyzing failed conversation generations. The primary goal is to capture the `stop_reason` from Claude's API and identify truncated responses BEFORE they enter the production pipeline.

**Critical Problem**: Currently, truncated responses (ending mid-sentence with `\`) are being stored as valid conversations. Analysis shows these truncations occur at ~1,000 tokens (4,332 bytes) - FAR below the 24,576 token limit, indicating the root cause is unknown. Without capturing `stop_reason` from Claude's API, we cannot diagnose why generation stops prematurely.

**Solution Approach**: 
1. Capture `stop_reason` from Claude API responses (CRITICAL FIRST STEP)
2. Detect truncation patterns in generated content
3. Store failed generations in separate diagnostic table
4. Prevent truncated content from entering production pipeline
5. Provide UI for analyzing failure patterns

---

## Architecture Decision: Database Schema Design

### Alternatives Considered

#### **Option A: Extend Existing Conversations Table**

**Approach**: Add columns to conversations table: `stop_reason`, `truncation_detected`, `truncation_pattern`

**Pros**:
- Simpler implementation
- Single source of truth
- Reuses existing storage infrastructure
- Can query all generations (success + failed) together

**Cons**:
- Mixes production and diagnostic data
- Complicates queries (need to filter `status='failed'` everywhere)
- Risk of accidentally exporting failed data in training files
- Limited space for detailed diagnostic information
- Different retention policies difficult (production vs diagnostics)

---

#### **Option B: Separate failed_generations Table** ✅ **SELECTED**

**Approach**: Create dedicated table for failed generations with comprehensive diagnostics

**Pros**:
- **Clean separation** of production vs diagnostic data
- **Zero risk** of failed data entering training exports
- **Detailed diagnostics** without bloating production schema
- **Independent retention** policies (keep failures longer for analysis)
- **Specialized queries** for failure pattern analysis
- **Clear intent** - if it's in this table, it failed

**Cons**:
- Additional table to maintain
- Need separate service layer methods
- Slightly more complex implementation

**Why Selected**: The separation of concerns is critical for data quality. Training data quality is paramount - we cannot risk truncated conversations entering LoRA training. A separate table provides the strongest guarantee and most flexible diagnostic capabilities.

---

#### **Option C: Hybrid Approach**

**Approach**: Use conversations table with `status='failed'` but store full error report in JSONB column `error_details`

**Pros**:
- Single table for all generations
- Flexible JSONB storage for diagnostics
- Can query relationships between success/failed

**Cons**:
- JSONB queries are slower than structured columns
- Still risk of accidental export if filter logic has bugs
- Harder to enforce data integrity on JSONB

---

### Selected Architecture: Option B (Separate Table)

**Database Schema**:

```sql
CREATE TABLE failed_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,  -- Reference to attempted conversation (if created)
  run_id UUID,           -- Batch run ID (if applicable)
  
  -- Request Context
  prompt TEXT NOT NULL,
  prompt_length INTEGER NOT NULL,
  model VARCHAR(100) NOT NULL,
  max_tokens INTEGER NOT NULL,
  temperature NUMERIC(3,2),
  structured_outputs_enabled BOOLEAN DEFAULT true,
  
  -- Response Data (Raw)
  raw_response JSONB NOT NULL,
  response_content TEXT,
  
  -- Critical Diagnostic Fields
  stop_reason VARCHAR(50),  -- 'end_turn', 'max_tokens', 'stop_sequence', 'tool_use', or NULL
  
  -- Token Usage
  input_tokens INTEGER,
  output_tokens INTEGER,
  
  -- Failure Analysis
  failure_type VARCHAR(50) NOT NULL,  -- 'truncation', 'parse_error', 'api_error', 'validation_error'
  truncation_pattern VARCHAR(50),     -- 'escaped_quote', 'mid_word', 'lone_backslash', etc.
  truncation_details TEXT,            -- Human-readable description
  
  -- Error Context
  error_message TEXT,
  error_stack TEXT,
  
  -- Storage
  raw_file_path TEXT,  -- Path to full RAW Error File Report in storage
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- Scaffolding Provenance
  persona_id UUID,
  emotional_arc_id UUID,
  training_topic_id UUID,
  template_id UUID,
  
  -- Indexes for querying patterns
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX idx_failed_generations_failure_type ON failed_generations(failure_type);
CREATE INDEX idx_failed_generations_stop_reason ON failed_generations(stop_reason);
CREATE INDEX idx_failed_generations_created_at ON failed_generations(created_at DESC);
CREATE INDEX idx_failed_generations_pattern ON failed_generations(truncation_pattern) WHERE truncation_pattern IS NOT NULL;
```

**Storage Bucket**: `failed-generation-files` (create if doesn't exist)

**File Structure**: RAW Error File Report (JSON format)
```
failed-generation-files/
  {year}/{month}/
    failed-{uuid}-{timestamp}.json
```

---

## Implementation Strategy

### Prompt Sequencing Rationale

**Prompt 1: Foundation Layer (Phase 1 + Database)**
- **Why First**: Must capture `stop_reason` immediately to gather diagnostic data
- **Scope**: 
  - Update `claude-api-client.ts` to capture `stop_reason`
  - Create `failed_generations` table
  - Implement `FailedGenerationService`
  - Create truncation detection utility
- **Output**: Complete foundation for failure detection and storage
- **Risk**: Low - straightforward schema and API changes

**Prompt 2: Integration Layer (Fail-Fast Logic)**
- **Why Second**: Integrates detection with generation pipeline
- **Scope**:
  - Modify `conversation-generation-service.ts` to check failures
  - Add fail-fast logic (throw before production storage)
  - Store failed generations with full context
  - Ensure batch jobs continue after individual failure
- **Output**: Production pipeline protected from truncated data
- **Risk**: Medium - must not break existing generation flow

**Prompt 3: Visibility Layer (UI + Monitoring)**
- **Why Last**: User-facing components depend on working backend
- **Scope**:
  - Create `/conversations/failed` page
  - Failed generations table component
  - Error report viewer modal
  - Download RAW error file capability
  - Filtering by failure_type, stop_reason, date
- **Output**: Complete visibility into failure patterns
- **Risk**: Low - pure UI implementation

---

## Quality Assurance Approach

### Testing Strategy

**Per-Prompt Validation**:
1. **Functional Tests**: Each prompt includes specific test scenarios
2. **Integration Tests**: Verify interaction with existing services
3. **Edge Case Tests**: Special characters, large prompts, timeout conditions
4. **Performance Tests**: Ensure no degradation to generation speed

**Cross-Prompt Validation**:
- End-to-end test: Trigger truncation → Verify storage → View in UI
- Batch generation test: Mix of success/failure in same batch
- Pattern analysis: Query failures by stop_reason and truncation_pattern

### Success Criteria

**Phase 1 (Prompt 1)**:
- ✅ `stop_reason` captured on every Claude API call
- ✅ `failed_generations` table created with all indexes
- ✅ FailedGenerationService CRUD operations working
- ✅ Truncation detection identifies known patterns

**Phase 2 (Prompt 2)**:
- ✅ Truncated responses do NOT enter conversations table
- ✅ Failed generations stored with complete diagnostic data
- ✅ Batch jobs continue after individual failure
- ✅ RAW Error File Report generated with analysis

**Phase 3 (Prompt 3)**:
- ✅ `/conversations/failed` page renders failed generations
- ✅ Can filter by failure_type, stop_reason, date range
- ✅ Error report modal shows full diagnostic data
- ✅ Can download RAW Error File Report JSON

---

## Database Setup Instructions

### Required SQL Operations

**Execute BEFORE implementing prompts using SAOL.**

========================

```sql
-- Migration: Create Failed Generations Table
-- Date: 2025-12-02
-- Purpose: Store failed conversation generations for diagnostic analysis

-- Create failed_generations table
CREATE TABLE IF NOT EXISTS failed_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  run_id UUID,
  
  -- Request context
  prompt TEXT NOT NULL,
  prompt_length INTEGER NOT NULL,
  model VARCHAR(100) NOT NULL,
  max_tokens INTEGER NOT NULL,
  temperature NUMERIC(3,2),
  structured_outputs_enabled BOOLEAN DEFAULT true,
  
  -- Response data (raw)
  raw_response JSONB NOT NULL,
  response_content TEXT,
  
  -- Critical diagnostic fields
  stop_reason VARCHAR(50),
  
  -- Token usage
  input_tokens INTEGER,
  output_tokens INTEGER,
  
  -- Failure analysis
  failure_type VARCHAR(50) NOT NULL,
  truncation_pattern VARCHAR(50),
  truncation_details TEXT,
  
  -- Error context
  error_message TEXT,
  error_stack TEXT,
  
  -- Storage
  raw_file_path TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  -- Scaffolding provenance
  persona_id UUID,
  emotional_arc_id UUID,
  training_topic_id UUID,
  template_id UUID,
  
  CONSTRAINT fk_failed_generations_user
    FOREIGN KEY (created_by)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_failed_generations_failure_type ON failed_generations(failure_type);
CREATE INDEX idx_failed_generations_stop_reason ON failed_generations(stop_reason);
CREATE INDEX idx_failed_generations_created_at ON failed_generations(created_at DESC);
CREATE INDEX idx_failed_generations_pattern ON failed_generations(truncation_pattern) WHERE truncation_pattern IS NOT NULL;
CREATE INDEX idx_failed_generations_run_id ON failed_generations(run_id) WHERE run_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE failed_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own failed generations
CREATE POLICY "Users can view own failed generations"
  ON failed_generations FOR SELECT
  USING (auth.uid() = created_by);

-- RLS Policy: System can insert failed generations
CREATE POLICY "System can create failed generations"
  ON failed_generations FOR INSERT
  WITH CHECK (true);

-- Add table comments
COMMENT ON TABLE failed_generations IS 'Stores failed conversation generations with comprehensive diagnostic data for analysis';
COMMENT ON COLUMN failed_generations.stop_reason IS 'Claude API stop reason: end_turn, max_tokens, stop_sequence, tool_use, or NULL';
COMMENT ON COLUMN failed_generations.failure_type IS 'Categorizes failure: truncation, parse_error, api_error, validation_error';
COMMENT ON COLUMN failed_generations.truncation_pattern IS 'Specific truncation pattern detected: escaped_quote, mid_word, lone_backslash, etc.';

-- Verify table created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'failed_generations'
ORDER BY ordinal_position;
```

**Validation Steps:**
1. Run migration using SAOL: `agentQuery()` to verify table exists
2. Check indexes: `SELECT indexname FROM pg_indexes WHERE tablename = 'failed_generations';`
3. Verify RLS enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'failed_generations';`

++++++++++++++++++

---

## Implementation Prompts

### Prompt 1: Foundation Layer - stop_reason Capture, Database, and Service Layer

**Scope**: Capture `stop_reason` from Claude API, create `failed_generations` table, implement FailedGenerationService, create truncation detection utility  
**Dependencies**: Existing `claude-api-client.ts`, Supabase database, SAOL library  
**Estimated Time**: 6-8 hours  
**Risk Level**: Low

========================

You are a senior full-stack developer implementing the Foundation Layer for the Failed Generation Storage & Visibility System for the BrightHub BRun LoRA Training Data Platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The BrightHub BRun platform generates emotionally-intelligent financial planning conversations for LoRA fine-tuning. We have discovered a critical issue: Some generated conversations are truncated mid-sentence (ending with `\` escape characters), but we don't know WHY because we're not capturing the `stop_reason` field from Claude's API.

**Critical Problem:**
- Truncated responses are being stored as valid conversations
- Truncations occur at ~1,000 tokens (far below 24,576 token limit)
- Without `stop_reason`, we cannot diagnose root cause
- Truncated data will degrade LoRA model quality

**Functional Requirements Being Implemented:**
- **FR-STOP-REASON**: Capture `stop_reason` from Claude API on EVERY response
- **FR-DETECT-TRUNCATION**: Detect truncated content patterns before storage
- **FR-STORE-FAILURES**: Store failed generations in separate diagnostic table
- **FR-NO-RETRY**: Do NOT retry - we need to understand patterns first

**Acceptance Criteria:**
1. Every Claude API call logs `stop_reason` to console
2. `ClaudeAPIResponse` interface includes `stop_reason` field
3. `failed_generations` table exists with all indexes and RLS policies
4. `FailedGenerationService` provides CRUD operations for failures
5. `detectTruncatedContent()` identifies known truncation patterns
6. Type safety: All TypeScript strict mode checks pass

**Technical Architecture:**
- Next.js 14 App Router with TypeScript (strict mode)
- Supabase PostgreSQL database with Row Level Security
- Service layer pattern for database operations
- Strategy pattern for detection utilities

---

**CURRENT CODEBASE STATE:**

**File: `src/lib/services/claude-api-client.ts`** (lines 305-328)

Current code IGNORES `stop_reason`:

```typescript
// Line 305-309: Extract content (Claude returns array of content blocks)
const content = data.content
  .map((block: any) => block.text)
  .join('\n');

// Calculate cost
const tier = this.getModelTier(model);
const cost = calculateCost(
  tier,
  data.usage.input_tokens,
  data.usage.output_tokens
);

// Line 318-328: Return response WITHOUT stop_reason
return {
  id: data.id,
  content,
  model: data.model,
  usage: {
    input_tokens: data.usage.input_tokens,
    output_tokens: data.usage.output_tokens,
  },
  cost,
  durationMs: 0, // Will be set by caller
};
```

**Claude API Response Structure** (from Anthropic docs):
```json
{
  "id": "msg_abc123",
  "content": [{"type": "text", "text": "..."}],
  "model": "claude-3-5-sonnet-20241022",
  "stop_reason": "end_turn",  // <-- CRITICAL FIELD WE'RE MISSING
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 5678
  }
}
```

**stop_reason Values:**
- `"end_turn"` - Claude finished naturally (complete response) ✅
- `"max_tokens"` - Hit token limit (TRUNCATED response) ⚠️
- `"stop_sequence"` - Hit stop sequence
- `"tool_use"` - Claude is calling a tool

**Existing Type: `ClaudeAPIResponse`** (lines 41-51):
```typescript
export interface ClaudeAPIResponse {
  id: string;
  content: string;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cost: number;
  durationMs: number;
}
```

**Existing Service Pattern** (`src/lib/services/conversation-storage-service.ts`):
The codebase follows a service layer pattern with Supabase client injection. Reference this for FailedGenerationService structure.

---

**IMPLEMENTATION TASKS:**

**Task 1.1: Update ClaudeAPIClient to Capture stop_reason (CRITICAL)**

**Step 1**: Update `ClaudeAPIResponse` interface

File: `src/lib/services/claude-api-client.ts` (lines 41-51)

```typescript
export interface ClaudeAPIResponse {
  id: string;
  content: string;
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';  // NEW
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  cost: number;
  durationMs: number;
}
```

**Step 2**: Capture `stop_reason` in `callAPI()` method

File: `src/lib/services/claude-api-client.ts` (after line 308, before cost calculation)

```typescript
// Extract content (Claude returns array of content blocks)
const content = data.content
  .map((block: any) => block.text)
  .join('\n');

// NEW: Capture stop_reason from API response
const stopReason = data.stop_reason;

// NEW: Log for debugging (ALWAYS log this)
console.log(`[${requestId}] stop_reason: ${stopReason}`);
console.log(`[${requestId}] output_tokens: ${data.usage.output_tokens}`);
console.log(`[${requestId}] max_tokens configured: ${maxTokens}`);

// NEW: Warn if stop_reason indicates truncation
if (stopReason === 'max_tokens') {
  console.warn(`[${requestId}] ⚠️ Response truncated due to max_tokens limit`);
  console.warn(`[${requestId}] Input: ${data.usage.input_tokens}, Output: ${data.usage.output_tokens}, Max: ${maxTokens}`);
}

// Calculate cost (existing code)
const tier = this.getModelTier(model);
const cost = calculateCost(
  tier,
  data.usage.input_tokens,
  data.usage.output_tokens
);

// NEW: Return stop_reason in response object
return {
  id: data.id,
  content,
  model: data.model,
  stop_reason: stopReason,  // NEW
  usage: {
    input_tokens: data.usage.input_tokens,
    output_tokens: data.usage.output_tokens,
  },
  cost,
  durationMs: 0,
};
```

**Step 3**: Update generation logging to include stop_reason

File: `src/lib/services/claude-api-client.ts` (lines 154-176)

In the `generationLogService.logGeneration()` call, add to `responsePayload`:

```typescript
responsePayload: {
  id: response.id,
  content: response.content,
  stop_reason: response.stop_reason,  // NEW: Log stop_reason
},
```

---

**Task 1.2: Verify Database Migration Executed**

**Use SAOL** to verify the `failed_generations` table was created in Database Setup Instructions above.

```javascript
// Run this verification script
const saol = require('supa-agent-ops');
require('dotenv').config({ path: '../.env.local' });

(async () => {
  // Check table exists
  const schema = await saol.agentIntrospectSchema({
    table: 'failed_generations',
    transport: 'pg'
  });
  
  console.log('Table exists:', schema.tables[0].exists);
  console.log('Columns:', schema.tables[0].columns.map(c => c.name));
  
  // Verify indexes
  const indexes = await saol.agentQuery({
    query: `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'failed_generations'
    `
  });
  
  console.log('Indexes:', indexes.data);
})();
```

Document verification results in a comment block at the top of FailedGenerationService.

---

**Task 1.3: Implement FailedGenerationService**

Create `src/lib/services/failed-generation-service.ts`:

```typescript
/**
 * Failed Generation Service
 * 
 * Manages storage and retrieval of failed conversation generations
 * for diagnostic analysis and pattern identification.
 * 
 * Features:
 * - Store failed generations with full diagnostic context
 * - Query failures by type, stop_reason, pattern
 * - Generate RAW Error File Report JSON
 * - Supabase Storage integration for error files
 * 
 * @module failed-generation-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

/**
 * Failed generation record matching database schema
 */
export interface FailedGeneration {
  id: string;
  conversation_id: string | null;
  run_id: string | null;
  
  // Request context
  prompt: string;
  prompt_length: number;
  model: string;
  max_tokens: number;
  temperature: number | null;
  structured_outputs_enabled: boolean;
  
  // Response data
  raw_response: any; // JSONB
  response_content: string | null;
  
  // Diagnostics
  stop_reason: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  
  // Failure analysis
  failure_type: 'truncation' | 'parse_error' | 'api_error' | 'validation_error';
  truncation_pattern: string | null;
  truncation_details: string | null;
  
  // Error context
  error_message: string | null;
  error_stack: string | null;
  
  // Storage
  raw_file_path: string | null;
  
  // Metadata
  created_at: string;
  created_by: string;
  
  // Scaffolding
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;
}

/**
 * Input for creating a failed generation record
 */
export interface CreateFailedGenerationInput {
  conversation_id?: string;
  run_id?: string;
  
  // Request context
  prompt: string;
  model: string;
  max_tokens: number;
  temperature?: number;
  structured_outputs_enabled?: boolean;
  
  // Response data (from Claude API)
  raw_response: any;
  response_content: string;
  
  // Diagnostics
  stop_reason?: string;
  input_tokens?: number;
  output_tokens?: number;
  
  // Failure analysis
  failure_type: FailedGeneration['failure_type'];
  truncation_pattern?: string;
  truncation_details?: string;
  
  // Error context
  error_message?: string;
  error_stack?: string;
  
  // Metadata
  created_by: string;
  
  // Scaffolding
  persona_id?: string;
  emotional_arc_id?: string;
  training_topic_id?: string;
  template_id?: string;
}

/**
 * RAW Error File Report structure
 */
export interface ErrorFileReport {
  error_report: {
    failure_type: string;
    stop_reason: string | null;
    stop_reason_analysis: string;
    truncation_pattern: string | null;
    truncation_details: string | null;
    timestamp: string;
    analysis: {
      input_tokens: number;
      output_tokens: number;
      max_tokens_configured: number;
      tokens_remaining: number;
      conclusion: string;
    };
  };
  request_context: {
    model: string;
    temperature: number;
    max_tokens: number;
    structured_outputs_enabled: boolean;
    prompt_length: number;
  };
  raw_response: any;
  extracted_content: string;
  scaffolding_context?: {
    persona_id?: string;
    emotional_arc_id?: string;
    training_topic_id?: string;
    template_id?: string;
  };
}

/**
 * Custom error classes
 */
export class FailedGenerationNotFoundError extends Error {
  constructor(id: string) {
    super(`Failed generation not found: ${id}`);
    this.name = 'FailedGenerationNotFoundError';
  }
}

/**
 * Failed Generation Service
 */
export class FailedGenerationService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Store a failed generation with full diagnostic context
   * Also creates RAW Error File Report and uploads to storage
   */
  async storeFailedGeneration(input: CreateFailedGenerationInput): Promise<FailedGeneration> {
    const failureId = randomUUID();
    console.log(`[FailedGenerationService] Storing failed generation ${failureId}`);

    try {
      // Step 1: Create RAW Error File Report
      const errorReport = this.createErrorReport(input, failureId);

      // Step 2: Upload error report to storage
      const filePath = await this.uploadErrorReport(errorReport, failureId);

      // Step 3: Insert failed generation record
      const record = {
        id: failureId,
        conversation_id: input.conversation_id || null,
        run_id: input.run_id || null,
        
        prompt: input.prompt,
        prompt_length: input.prompt.length,
        model: input.model,
        max_tokens: input.max_tokens,
        temperature: input.temperature || null,
        structured_outputs_enabled: input.structured_outputs_enabled !== false,
        
        raw_response: input.raw_response,
        response_content: input.response_content,
        
        stop_reason: input.stop_reason || null,
        input_tokens: input.input_tokens || null,
        output_tokens: input.output_tokens || null,
        
        failure_type: input.failure_type,
        truncation_pattern: input.truncation_pattern || null,
        truncation_details: input.truncation_details || null,
        
        error_message: input.error_message || null,
        error_stack: input.error_stack || null,
        
        raw_file_path: filePath,
        
        created_by: input.created_by,
        
        persona_id: input.persona_id || null,
        emotional_arc_id: input.emotional_arc_id || null,
        training_topic_id: input.training_topic_id || null,
        template_id: input.template_id || null,
      };

      const { data, error } = await this.supabase
        .from('failed_generations')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('[FailedGenerationService] Error inserting record:', error);
        throw new Error(`Failed to store failed generation: ${error.message}`);
      }

      console.log(`[FailedGenerationService] ✅ Stored failed generation ${failureId}`);
      return data as FailedGeneration;
    } catch (error) {
      console.error('[FailedGenerationService] Error storing failed generation:', error);
      throw error;
    }
  }

  /**
   * Get failed generation by ID
   */
  async getFailedGeneration(id: string): Promise<FailedGeneration | null> {
    try {
      const { data, error } = await this.supabase
        .from('failed_generations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as FailedGeneration;
    } catch (error) {
      console.error('[FailedGenerationService] Error fetching failed generation:', error);
      throw error;
    }
  }

  /**
   * List failed generations with filters
   */
  async listFailedGenerations(filters?: {
    failure_type?: FailedGeneration['failure_type'];
    stop_reason?: string;
    truncation_pattern?: string;
    run_id?: string;
    created_by?: string;
    date_from?: string;
    date_to?: string;
  }, pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ failures: FailedGeneration[]; total: number }> {
    try {
      let query = this.supabase
        .from('failed_generations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.failure_type) {
        query = query.eq('failure_type', filters.failure_type);
      }
      if (filters?.stop_reason) {
        query = query.eq('stop_reason', filters.stop_reason);
      }
      if (filters?.truncation_pattern) {
        query = query.eq('truncation_pattern', filters.truncation_pattern);
      }
      if (filters?.run_id) {
        query = query.eq('run_id', filters.run_id);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 25;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        failures: (data || []) as FailedGeneration[],
        total: count || 0,
      };
    } catch (error) {
      console.error('[FailedGenerationService] Error listing failed generations:', error);
      throw error;
    }
  }

  /**
   * Get failure statistics
   */
  async getFailureStatistics(filters?: { run_id?: string; date_from?: string; date_to?: string }): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_stop_reason: Record<string, number>;
    by_pattern: Record<string, number>;
  }> {
    try {
      // This would ideally use aggregate queries, but for now we'll fetch and process
      const { failures } = await this.listFailedGenerations(filters, { limit: 1000 });

      const by_type: Record<string, number> = {};
      const by_stop_reason: Record<string, number> = {};
      const by_pattern: Record<string, number> = {};

      for (const failure of failures) {
        // Count by failure_type
        by_type[failure.failure_type] = (by_type[failure.failure_type] || 0) + 1;

        // Count by stop_reason
        if (failure.stop_reason) {
          by_stop_reason[failure.stop_reason] = (by_stop_reason[failure.stop_reason] || 0) + 1;
        }

        // Count by truncation_pattern
        if (failure.truncation_pattern) {
          by_pattern[failure.truncation_pattern] = (by_pattern[failure.truncation_pattern] || 0) + 1;
        }
      }

      return {
        total: failures.length,
        by_type,
        by_stop_reason,
        by_pattern,
      };
    } catch (error) {
      console.error('[FailedGenerationService] Error getting failure statistics:', error);
      throw error;
    }
  }

  /**
   * Create RAW Error File Report
   * @private
   */
  private createErrorReport(input: CreateFailedGenerationInput, failureId: string): ErrorFileReport {
    const inputTokens = input.input_tokens || 0;
    const outputTokens = input.output_tokens || 0;
    const maxTokens = input.max_tokens;
    const tokensRemaining = maxTokens - outputTokens;

    // Analyze stop_reason
    let stopReasonAnalysis = 'Unknown';
    if (input.stop_reason === 'end_turn') {
      stopReasonAnalysis = 'Claude finished naturally, but content appears truncated - unexpected behavior';
    } else if (input.stop_reason === 'max_tokens') {
      stopReasonAnalysis = 'Claude hit max_tokens limit - response was cut off';
    } else if (!input.stop_reason) {
      stopReasonAnalysis = 'stop_reason not available - may indicate API error or missing field';
    }

    // Determine conclusion
    let conclusion = '';
    if (input.stop_reason === 'max_tokens') {
      conclusion = `Truncation caused by max_tokens limit (${maxTokens})`;
    } else if (tokensRemaining > maxTokens * 0.8) {
      conclusion = `Truncation occurred FAR below max_tokens limit (used ${outputTokens}/${maxTokens} tokens) - root cause unknown`;
    } else {
      conclusion = 'Truncation cause unclear - review raw response and stop_reason';
    }

    return {
      error_report: {
        failure_type: input.failure_type,
        stop_reason: input.stop_reason || null,
        stop_reason_analysis: stopReasonAnalysis,
        truncation_pattern: input.truncation_pattern || null,
        truncation_details: input.truncation_details || null,
        timestamp: new Date().toISOString(),
        analysis: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          max_tokens_configured: maxTokens,
          tokens_remaining: tokensRemaining,
          conclusion,
        },
      },
      request_context: {
        model: input.model,
        temperature: input.temperature || 0.7,
        max_tokens: maxTokens,
        structured_outputs_enabled: input.structured_outputs_enabled !== false,
        prompt_length: input.prompt.length,
      },
      raw_response: input.raw_response,
      extracted_content: input.response_content,
      scaffolding_context: {
        persona_id: input.persona_id,
        emotional_arc_id: input.emotional_arc_id,
        training_topic_id: input.training_topic_id,
        template_id: input.template_id,
      },
    };
  }

  /**
   * Upload error report to Supabase Storage
   * @private
   */
  private async uploadErrorReport(report: ErrorFileReport, failureId: string): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timestamp = now.toISOString().replace(/[:.]/g, '-');

      const filePath = `${year}/${month}/failed-${failureId}-${timestamp}.json`;
      const fileContent = JSON.stringify(report, null, 2);
      const fileBlob = new Blob([fileContent], { type: 'application/json' });

      const { error } = await this.supabase.storage
        .from('failed-generation-files')
        .upload(filePath, fileBlob, {
          contentType: 'application/json',
          upsert: false,
        });

      if (error) {
        console.error('[FailedGenerationService] Error uploading error report:', error);
        // Don't throw - we'll store the record without the file
        return '';
      }

      console.log(`[FailedGenerationService] ✅ Uploaded error report to ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('[FailedGenerationService] Error in uploadErrorReport:', error);
      return '';
    }
  }

  /**
   * Download error report from storage
   */
  async downloadErrorReport(failureId: string): Promise<ErrorFileReport | null> {
    try {
      const failure = await this.getFailedGeneration(failureId);
      if (!failure || !failure.raw_file_path) {
        return null;
      }

      const { data, error } = await this.supabase.storage
        .from('failed-generation-files')
        .download(failure.raw_file_path);

      if (error) {
        console.error('[FailedGenerationService] Error downloading error report:', error);
        return null;
      }

      const text = await data.text();
      return JSON.parse(text) as ErrorFileReport;
    } catch (error) {
      console.error('[FailedGenerationService] Error in downloadErrorReport:', error);
      return null;
    }
  }
}

/**
 * Export singleton instance
 */
let serviceInstance: FailedGenerationService | null = null;

export function getFailedGenerationService(): FailedGenerationService {
  if (!serviceInstance) {
    serviceInstance = new FailedGenerationService();
  }
  return serviceInstance;
}

export function resetFailedGenerationService(): void {
  serviceInstance = null;
}
```

---

**Task 1.4: Implement Truncation Detection Utility**

Create `src/lib/utils/truncation-detection.ts`:

```typescript
/**
 * Truncation Detection Utility
 * 
 * Detects if generated content appears to be truncated mid-generation.
 * Uses pattern matching to identify common truncation indicators.
 * 
 * @module truncation-detection
 */

/**
 * Truncation detection result
 */
export interface TruncationDetectionResult {
  isTruncated: boolean;
  pattern: string | null;
  details: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Truncation patterns to detect
 */
const TRUNCATION_PATTERNS = [
  {
    pattern: /\\"\s*$/,
    name: 'escaped_quote',
    desc: 'Ends with escaped quote (incomplete string literal)',
    confidence: 'high' as const,
  },
  {
    pattern: /\\\s*$/,
    name: 'lone_backslash',
    desc: 'Ends with lone backslash (incomplete escape sequence)',
    confidence: 'high' as const,
  },
  {
    pattern: /[a-zA-Z]{3,}\s*$/,
    name: 'mid_word',
    desc: 'Ends mid-word without punctuation',
    confidence: 'medium' as const,
  },
  {
    pattern: /,\s*$/,
    name: 'trailing_comma',
    desc: 'Ends with comma (incomplete list/object)',
    confidence: 'medium' as const,
  },
  {
    pattern: /:\s*$/,
    name: 'trailing_colon',
    desc: 'Ends after property colon (incomplete JSON key-value)',
    confidence: 'high' as const,
  },
  {
    pattern: /\(\s*$/,
    name: 'open_paren',
    desc: 'Ends with unclosed parenthesis',
    confidence: 'medium' as const,
  },
  {
    pattern: /\[\s*$/,
    name: 'open_bracket',
    desc: 'Ends with unclosed bracket',
    confidence: 'medium' as const,
  },
  {
    pattern: /\{\s*$/,
    name: 'open_brace',
    desc: 'Ends with unclosed brace',
    confidence: 'medium' as const,
  },
  {
    pattern: /"[^"]{50,}\s*$/,
    name: 'long_unclosed_string',
    desc: 'Ends with long unclosed string (>50 chars without closing quote)',
    confidence: 'high' as const,
  },
];

/**
 * Proper ending patterns (indicate complete content)
 */
const PROPER_ENDINGS = /[.!?'")\]}\n]\s*$/;

/**
 * Detect if content appears to be truncated
 * 
 * @param content - The generated content to analyze
 * @returns Truncation detection result with pattern and confidence
 * 
 * @example
 * ```typescript
 * const result = detectTruncatedContent('This is a test \\');
 * if (result.isTruncated) {
 *   console.log(`Truncated: ${result.pattern} - ${result.details}`);
 * }
 * ```
 */
export function detectTruncatedContent(content: string): TruncationDetectionResult {
  if (!content || content.trim().length === 0) {
    return {
      isTruncated: false,
      pattern: null,
      details: 'Empty content',
      confidence: 'low',
    };
  }

  const trimmed = content.trim();

  // Check against known truncation patterns
  for (const { pattern, name, desc, confidence } of TRUNCATION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isTruncated: true,
        pattern: name,
        details: desc,
        confidence,
      };
    }
  }

  // Check if ends with proper punctuation (NOT truncated)
  if (PROPER_ENDINGS.test(trimmed)) {
    return {
      isTruncated: false,
      pattern: null,
      details: 'Content appears complete (ends with proper punctuation)',
      confidence: 'high',
    };
  }

  // Long content without proper ending is suspicious
  if (trimmed.length > 100) {
    return {
      isTruncated: true,
      pattern: 'no_punctuation',
      details: 'Long content does not end with expected punctuation',
      confidence: 'low',
    };
  }

  // Short content without clear pattern
  return {
    isTruncated: false,
    pattern: null,
    details: 'Content appears complete (no truncation patterns detected)',
    confidence: 'medium',
  };
}

/**
 * Analyze assistant responses in a conversation for truncation
 * User responses are not checked (assumed complete input)
 * 
 * @param turns - Array of conversation turns
 * @returns Array of truncation results for assistant turns only
 */
export function detectTruncatedTurns(turns: Array<{ role: 'user' | 'assistant'; content: string }>): Array<{
  turnIndex: number;
  role: 'assistant';
  result: TruncationDetectionResult;
}> {
  const results: Array<{ turnIndex: number; role: 'assistant'; result: TruncationDetectionResult }> = [];

  turns.forEach((turn, index) => {
    // Only check assistant turns (user input is assumed complete)
    if (turn.role === 'assistant') {
      const result = detectTruncatedContent(turn.content);
      if (result.isTruncated) {
        results.push({
          turnIndex: index,
          role: 'assistant',
          result,
        });
      }
    }
  });

  return results;
}

/**
 * Get human-readable summary of truncation detection
 */
export function getTruncationSummary(result: TruncationDetectionResult): string {
  if (!result.isTruncated) {
    return '✓ Content appears complete';
  }

  const emoji = result.confidence === 'high' ? '⚠️' : '⚡';
  return `${emoji} Truncated: ${result.details} (${result.confidence} confidence)`;
}
```

---

**ACCEPTANCE CRITERIA:**

1. **stop_reason Capture**:
   - ✅ `ClaudeAPIResponse` interface includes `stop_reason` field
   - ✅ `stop_reason` captured in `callAPI()` method (line ~310)
   - ✅ `stop_reason` logged on EVERY API call with output_tokens
   - ✅ Warning logged when `stop_reason === 'max_tokens'`
   - ✅ `stop_reason` included in generation logs
   - ✅ TypeScript strict mode passes

2. **Database Verification**:
   - ✅ `failed_generations` table exists with all columns
   - ✅ All indexes created (failure_type, stop_reason, created_at, pattern, run_id)
   - ✅ RLS enabled with correct policies
   - ✅ Foreign key constraint to auth.users exists
   - ✅ SAOL verification script runs successfully

3. **FailedGenerationService**:
   - ✅ Service class created with Supabase client injection
   - ✅ `storeFailedGeneration()` creates record + uploads error report
   - ✅ `getFailedGeneration()` retrieves by ID
   - ✅ `listFailedGenerations()` supports filtering and pagination
   - ✅ `getFailureStatistics()` aggregates failure patterns
   - ✅ `createErrorReport()` generates comprehensive diagnostic JSON
   - ✅ `uploadErrorReport()` saves to `failed-generation-files` bucket
   - ✅ Error handling with try-catch on all async methods
   - ✅ Console logging for debugging

4. **Truncation Detection**:
   - ✅ `detectTruncatedContent()` identifies all patterns in TRUNCATION_PATTERNS
   - ✅ Returns structured result with pattern, details, confidence
   - ✅ `detectTruncatedTurns()` analyzes conversation turns (assistant only)
   - ✅ Proper ending detection (`.!?")\]}`) marks content as complete
   - ✅ Edge cases handled: empty content, very short content, long content

5. **Code Quality**:
   - ✅ JSDoc comments on all public functions and interfaces
   - ✅ TypeScript strict mode compilation passes
   - ✅ Follows existing service layer patterns
   - ✅ Error messages are descriptive and actionable

---

**VALIDATION REQUIREMENTS:**

**Manual Test 1: stop_reason Capture**

```typescript
// File: scripts/test-stop-reason-capture.ts
import { getClaudeAPIClient } from '../src/lib/services/claude-api-client';

const client = getClaudeAPIClient();

const testPrompt = `Generate a JSON conversation with 3 turns between a user and financial advisor about retirement planning.`;

(async () => {
  console.log('Testing stop_reason capture...');
  
  const response = await client.generateConversation(testPrompt, {
    conversationId: 'test-stop-reason',
    userId: '00000000-0000-0000-0000-000000000000',
    maxTokens: 4000,
  });

  console.log('\n=== RESPONSE ===');
  console.log('stop_reason:', response.stop_reason);
  console.log('output_tokens:', response.usage.output_tokens);
  console.log('content length:', response.content.length);

  // Verify stop_reason is present
  if (!response.stop_reason) {
    console.error('❌ FAIL: stop_reason is missing!');
    process.exit(1);
  }

  console.log('✅ PASS: stop_reason captured successfully');
})();
```

Run: `npx tsx scripts/test-stop-reason-capture.ts`

Expected console output:
```
[req_123...] stop_reason: end_turn
[req_123...] output_tokens: 1234
[req_123...] max_tokens configured: 4000
✅ PASS: stop_reason captured successfully
```

---

**Manual Test 2: Failed Generation Storage**

```typescript
// File: scripts/test-failed-generation-storage.ts
import { getFailedGenerationService } from '../src/lib/services/failed-generation-service';
import { detectTruncatedContent } from '../src/lib/utils/truncation-detection';

const service = getFailedGenerationService();

(async () => {
  console.log('Testing failed generation storage...');

  // Simulate a truncated response
  const truncatedContent = 'This is a financial planning conversation that ends abruptly with \\';

  const truncationResult = detectTruncatedContent(truncatedContent);
  console.log('Truncation detected:', truncationResult);

  // Store as failed generation
  const failure = await service.storeFailedGeneration({
    prompt: 'Generate a conversation...',
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 24576,
    temperature: 0.7,
    raw_response: { /* mock response */ },
    response_content: truncatedContent,
    stop_reason: 'end_turn',  // Unexpected with truncation!
    input_tokens: 500,
    output_tokens: 200,
    failure_type: 'truncation',
    truncation_pattern: truncationResult.pattern,
    truncation_details: truncationResult.details,
    error_message: 'Content truncated mid-sentence',
    created_by: '00000000-0000-0000-0000-000000000000',
  });

  console.log('\n=== STORED FAILURE ===');
  console.log('ID:', failure.id);
  console.log('Failure Type:', failure.failure_type);
  console.log('Pattern:', failure.truncation_pattern);
  console.log('Stop Reason:', failure.stop_reason);
  console.log('File Path:', failure.raw_file_path);

  // Retrieve it
  const retrieved = await service.getFailedGeneration(failure.id);
  console.log('\n=== RETRIEVED ===');
  console.log('Match:', retrieved?.id === failure.id);

  // Download error report
  const report = await service.downloadErrorReport(failure.id);
  console.log('\n=== ERROR REPORT ===');
  console.log('Analysis:', report?.error_report.analysis.conclusion);

  console.log('\n✅ PASS: Failed generation storage working');
})();
```

Run: `npx tsx scripts/test-failed-generation-storage.ts`

Expected output:
```
Truncation detected: { isTruncated: true, pattern: 'lone_backslash', ... }
[FailedGenerationService] Storing failed generation abc-123...
[FailedGenerationService] ✅ Uploaded error report to 2025/12/failed-abc-123-....json
[FailedGenerationService] ✅ Stored failed generation abc-123

=== STORED FAILURE ===
ID: abc-123...
Failure Type: truncation
Pattern: lone_backslash
Stop Reason: end_turn
File Path: 2025/12/failed-abc-123-....json

✅ PASS: Failed generation storage working
```

---

**Manual Test 3: Truncation Pattern Detection**

```typescript
// File: scripts/test-truncation-detection.ts
import { detectTruncatedContent } from '../src/lib/utils/truncation-detection';

const testCases = [
  { content: 'This ends with a backslash \\', expected: true, pattern: 'lone_backslash' },
  { content: 'This ends with \\"', expected: true, pattern: 'escaped_quote' },
  { content: 'This is a complete sentence.', expected: false, pattern: null },
  { content: 'This ends mid-w', expected: true, pattern: 'mid_word' },
  { content: 'List item,', expected: true, pattern: 'trailing_comma' },
  { content: 'Property:', expected: true, pattern: 'trailing_colon' },
];

console.log('Testing truncation detection patterns...\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = detectTruncatedContent(test.content);
  const match = result.isTruncated === test.expected && result.pattern === test.pattern;

  if (match) {
    console.log(`✅ PASS: "${test.content}"`);
    console.log(`   Pattern: ${result.pattern}, Details: ${result.details}\n`);
    passed++;
  } else {
    console.log(`❌ FAIL: "${test.content}"`);
    console.log(`   Expected: ${test.expected} (${test.pattern})`);
    console.log(`   Got: ${result.isTruncated} (${result.pattern})\n`);
    failed++;
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n✅ All tests passed!');
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}
```

Run: `npx tsx scripts/test-truncation-detection.ts`

Expected output: All 6 test cases pass with correct pattern detection.

---

**DELIVERABLES:**

1. **Modified Files**:
   - ✅ `src/lib/services/claude-api-client.ts` - stop_reason capture added
   
2. **New Files**:
   - ✅ `src/lib/services/failed-generation-service.ts` - Complete service implementation
   - ✅ `src/lib/utils/truncation-detection.ts` - Detection utility
   - ✅ `scripts/test-stop-reason-capture.ts` - Verification script
   - ✅ `scripts/test-failed-generation-storage.ts` - Storage test
   - ✅ `scripts/test-truncation-detection.ts` - Pattern detection test

3. **Database**:
   - ✅ `failed_generations` table created (verified via SAOL)
   - ✅ All indexes and RLS policies in place

4. **Storage Bucket**:
   - ✅ `failed-generation-files` bucket created in Supabase Storage
   - ✅ Public access disabled (requires auth)

5. **Documentation**:
   - ✅ JSDoc comments on all public APIs
   - ✅ Inline code comments explaining critical logic
   - ✅ Test scripts with expected outputs documented

Implement this foundation layer completely, ensuring all acceptance criteria are met and all test scripts pass successfully.

++++++++++++++++++

---

### Prompt 2: Integration Layer - Fail-Fast Logic and Pipeline Protection

**Scope**: Integrate truncation detection into generation pipeline, add fail-fast validation, store failures before production storage  
**Dependencies**: Prompt 1 (FailedGenerationService and detection utilities), existing conversation-generation-service.ts  
**Estimated Time**: 6-8 hours  
**Risk Level**: Medium (must not break existing generation flow)

========================

You are a senior full-stack developer implementing the Integration Layer for the Failed Generation Storage & Visibility System for the BrightHub BRun LoRA Training Data Platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
In Prompt 1, we added `stop_reason` capture and created infrastructure for storing failed generations. Now we integrate this into the generation pipeline to PREVENT truncated content from entering production storage.

**Critical Requirement**: **FAIL FAST** - If a response is truncated or has `stop_reason !== 'end_turn'`, we must:
1. Store it as a failed generation with full diagnostics
2. Throw an error to prevent production storage
3. Continue batch generation (don't fail entire batch)

**Functional Requirements Being Implemented:**
- **FR-VALIDATE-RESPONSE**: Check `stop_reason` and content integrity BEFORE storage
- **FR-FAIL-FAST**: Throw error on detection, prevent production storage
- **FR-STORE-DIAGNOSTIC**: Store complete error context for analysis
- **FR-BATCH-RESILIENCE**: Individual failure doesn't stop batch job

**Acceptance Criteria:**
1. After Claude API call, validate `stop_reason` and content
2. If validation fails, store as failed generation and throw error
3. Successful responses proceed to production storage unchanged
4. Batch jobs log failure but continue processing remaining conversations
5. RAW Error File Report includes prompt, response, and analysis
6. No performance degradation to generation speed

**Technical Architecture:**
- Modify `conversation-generation-service.ts` only
- Use FailedGenerationService from Prompt 1
- Use detectTruncatedContent utility from Prompt 1
- Throw custom error types for different failure modes

---

**CURRENT CODEBASE STATE:**

**File: `src/lib/services/conversation-generation-service.ts`**

Current generation flow (lines 156-293):

```typescript
async generateSingleConversation(
  params: GenerationParams
): Promise<GenerationResult> {
  const startTime = Date.now();
  const generationId = randomUUID();

  try {
    // Step 1: Resolve template
    const resolvedTemplate = await this.templateResolver.resolveTemplate({...});

    // Step 2: Call Claude API
    const apiResponse = await this.claudeClient.generateConversation(
      resolvedTemplate.resolvedPrompt,
      {...}
    );

    // Step 3: Store raw response (CURRENT - NO VALIDATION!)
    const rawStorageResult = await this.storageService.storeRawResponse({...});

    // Step 4: Parse and store final version
    const parseResult = await this.storageService.parseAndStoreFinal({...});

    return {
      conversation: parseResult.conversation,
      success: true,
      metrics: {...},
    };
  } catch (error) {
    // Return error result
  }
}
```

**The Problem**: After `apiResponse` is received (Step 2), there's NO validation. Truncated responses go straight to storage (Step 3).

**The Solution**: Insert validation BETWEEN Step 2 and Step 3.

---

**IMPLEMENTATION TASKS:**

**Task 2.1: Add Imports**

File: `src/lib/services/conversation-generation-service.ts` (top of file)

Add these imports:

```typescript
import { getFailedGenerationService, CreateFailedGenerationInput } from './failed-generation-service';
import { detectTruncatedContent } from '../utils/truncation-detection';
```

---

**Task 2.2: Create Custom Error Classes**

File: `src/lib/services/conversation-generation-service.ts` (after imports, before class definition)

```typescript
/**
 * Custom error for truncated responses
 */
export class TruncatedResponseError extends Error {
  constructor(
    message: string,
    public stopReason: string | null,
    public pattern: string | null
  ) {
    super(message);
    this.name = 'TruncatedResponseError';
  }
}

/**
 * Custom error for unexpected stop reasons
 */
export class UnexpectedStopReasonError extends Error {
  constructor(
    message: string,
    public stopReason: string
  ) {
    super(message);
    this.name = 'UnexpectedStopReasonError';
  }
}
```

---

**Task 2.3: Add Validation Method to ConversationGenerationService Class**

File: `src/lib/services/conversation-generation-service.ts` (inside class, private method)

```typescript
/**
 * Validate Claude API response for completeness
 * Checks stop_reason and content truncation patterns
 * 
 * @param apiResponse - Response from Claude API
 * @param generationId - ID for logging
 * @throws TruncatedResponseError if content is truncated
 * @throws UnexpectedStopReasonError if stop_reason is not 'end_turn'
 * @private
 */
private validateAPIResponse(
  apiResponse: ClaudeAPIResponse,
  generationId: string
): void {
  console.log(`[${generationId}] Validating API response...`);

  // VALIDATION 1: Check stop_reason
  if (apiResponse.stop_reason !== 'end_turn') {
    console.warn(`[${generationId}] ⚠️ Unexpected stop_reason: ${apiResponse.stop_reason}`);
    throw new UnexpectedStopReasonError(
      `Generation failed: stop_reason was '${apiResponse.stop_reason}' instead of 'end_turn'`,
      apiResponse.stop_reason
    );
  }

  // VALIDATION 2: Check content for truncation patterns
  const truncationCheck = detectTruncatedContent(apiResponse.content);
  
  if (truncationCheck.isTruncated) {
    console.warn(`[${generationId}] ⚠️ Content appears truncated: ${truncationCheck.details}`);
    console.warn(`[${generationId}] Pattern: ${truncationCheck.pattern}, Confidence: ${truncationCheck.confidence}`);
    
    throw new TruncatedResponseError(
      `Generation failed: content truncated (${truncationCheck.pattern})`,
      apiResponse.stop_reason,
      truncationCheck.pattern
    );
  }

  console.log(`[${generationId}] ✓ Response validation passed`);
}
```

---

**Task 2.4: Add Store Failed Generation Method**

File: `src/lib/services/conversation-generation-service.ts` (inside class, private method)

```typescript
/**
 * Store failed generation with full diagnostic context
 * Creates RAW Error File Report and database record
 * 
 * @param error - The error that caused failure
 * @param context - Generation context (prompt, config, response)
 * @param generationId - ID for tracking
 * @private
 */
private async storeFailedGeneration(
  error: Error,
  context: {
    prompt: string;
    apiResponse: ClaudeAPIResponse;
    params: GenerationParams;
  },
  generationId: string
): Promise<void> {
  try {
    console.log(`[${generationId}] Storing as failed generation...`);

    const failedGenService = getFailedGenerationService();

    // Determine failure type and details
    let failureType: 'truncation' | 'parse_error' | 'api_error' | 'validation_error' = 'api_error';
    let truncationPattern: string | null = null;
    let truncationDetails: string | null = null;

    if (error instanceof TruncatedResponseError) {
      failureType = 'truncation';
      truncationPattern = error.pattern;
      truncationDetails = error.message;
    } else if (error instanceof UnexpectedStopReasonError) {
      failureType = 'truncation';  // Unexpected stop_reason treated as truncation
      truncationPattern = 'unexpected_stop_reason';
      truncationDetails = `stop_reason was '${error.stopReason}' instead of 'end_turn'`;
    }

    // Build failed generation input
    const input: CreateFailedGenerationInput = {
      conversation_id: generationId,
      run_id: context.params.runId,
      
      prompt: context.prompt,
      model: context.apiResponse.model,
      max_tokens: context.params.maxTokens || AI_CONFIG.maxTokens,
      temperature: context.params.temperature || AI_CONFIG.temperature,
      structured_outputs_enabled: true,
      
      raw_response: {
        id: context.apiResponse.id,
        model: context.apiResponse.model,
        stop_reason: context.apiResponse.stop_reason,
        usage: context.apiResponse.usage,
        cost: context.apiResponse.cost,
        durationMs: context.apiResponse.durationMs,
      },
      response_content: context.apiResponse.content,
      
      stop_reason: context.apiResponse.stop_reason,
      input_tokens: context.apiResponse.usage.input_tokens,
      output_tokens: context.apiResponse.usage.output_tokens,
      
      failure_type: failureType,
      truncation_pattern: truncationPattern,
      truncation_details: truncationDetails,
      
      error_message: error.message,
      error_stack: error.stack,
      
      created_by: context.params.userId,
      
      persona_id: context.params.scaffoldingIds?.personaId,
      emotional_arc_id: context.params.scaffoldingIds?.emotionalArcId,
      training_topic_id: context.params.scaffoldingIds?.trainingTopicId,
      template_id: context.params.templateId,
    };

    await failedGenService.storeFailedGeneration(input);

    console.log(`[${generationId}] ✅ Failed generation stored for analysis`);
  } catch (storeError) {
    console.error(`[${generationId}] ❌ Error storing failed generation:`, storeError);
    // Don't throw - we already have the original error to throw
  }
}
```

---

**Task 2.5: Integrate Validation into generateSingleConversation**

File: `src/lib/services/conversation-generation-service.ts` (lines 186-232)

**REPLACE** the section after Claude API call with:

```typescript
// Step 2: Generate conversation via Claude API
console.log(`[${generationId}] Step 2: Calling Claude API...`);
const apiResponse = await this.claudeClient.generateConversation(
  resolvedTemplate.resolvedPrompt,
  {
    conversationId: params.conversationId || generationId,
    templateId: params.templateId,
    temperature: params.temperature,
    maxTokens: params.maxTokens,
    userId: params.userId,
    runId: params.runId,
    useStructuredOutputs: true,
  }
);

console.log(
  `[${generationId}] ✓ API response received (${apiResponse.usage.output_tokens} tokens, $${apiResponse.cost.toFixed(4)})`
);

// NEW: Step 2.5: Validate API response BEFORE storage
try {
  this.validateAPIResponse(apiResponse, generationId);
} catch (validationError) {
  console.error(`[${generationId}] ❌ Response validation failed:`, validationError);
  
  // Store as failed generation for analysis
  await this.storeFailedGeneration(
    validationError as Error,
    {
      prompt: resolvedTemplate.resolvedPrompt,
      apiResponse,
      params,
    },
    generationId
  );
  
  // Re-throw to prevent production storage
  throw validationError;
}

// Step 3: Store raw response (ONLY if validation passed)
console.log(`[${generationId}] Step 3: Storing raw response...`);
const rawStorageResult = await this.storageService.storeRawResponse({
  conversationId: generationId,
  rawResponse: apiResponse.content,
  userId: params.userId,
  metadata: {
    templateId: params.templateId,
    tier: params.tier,
    personaId: params.scaffoldingIds?.personaId || params.parameters?.persona_id,
    emotionalArcId: params.scaffoldingIds?.emotionalArcId || params.parameters?.emotional_arc_id,
    trainingTopicId: params.scaffoldingIds?.trainingTopicId || params.parameters?.training_topic_id,
  },
});

// Continue with existing code (parseAndStoreFinal, etc.)
```

---

**Task 2.6: Update Batch Generation Error Handling**

File: `src/lib/services/batch-generation-service.ts` (if batch jobs are used)

**Context**: Batch jobs should continue after individual failures.

**Find** the conversation generation call in batch loop and wrap with try-catch:

```typescript
// Inside batch generation loop
for (const task of tasks) {
  try {
    const result = await conversationGenService.generateSingleConversation(task);
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
  } catch (error) {
    // Log error but continue batch
    console.error(`[Batch ${batchId}] Failed conversation ${task.conversationId}:`, error);
    failureCount++;
    
    // Store error details
    if (error instanceof TruncatedResponseError || error instanceof UnexpectedStopReasonError) {
      console.log(`[Batch ${batchId}] Failed generation already stored for analysis`);
    }
    
    // Continue to next conversation (don't throw)
  }
}

// Update batch status with success/failure counts
```

---

**Task 2.7: Add Missing AI_CONFIG Import**

File: `src/lib/services/conversation-generation-service.ts` (top of file)

Ensure `AI_CONFIG` is imported:

```typescript
import { AI_CONFIG } from '../ai-config';
```

---

**ACCEPTANCE CRITERIA:**

1. **Validation Integration**:
   - ✅ `validateAPIResponse()` called after Claude API, before storage
   - ✅ Checks `stop_reason === 'end_turn'`
   - ✅ Checks content for truncation patterns
   - ✅ Throws custom error types (TruncatedResponseError, UnexpectedStopReasonError)

2. **Failed Generation Storage**:
   - ✅ `storeFailedGeneration()` called on validation error
   - ✅ Complete diagnostic context stored (prompt, response, error)
   - ✅ RAW Error File Report uploaded to storage
   - ✅ Database record created with all fields

3. **Fail-Fast Behavior**:
   - ✅ Validation error prevents production storage
   - ✅ Error is re-thrown after storing failure
   - ✅ No conversation record in `conversations` table for failures
   - ✅ Successful responses proceed unchanged

4. **Batch Resilience**:
   - ✅ Individual failure doesn't stop batch job
   - ✅ Error logged but batch continues
   - ✅ Success/failure counts tracked accurately
   - ✅ Batch status updated with failure count

5. **Code Quality**:
   - ✅ All new methods have JSDoc comments
   - ✅ TypeScript strict mode passes
   - ✅ Error handling with try-catch
   - ✅ Console logging for debugging

---

**VALIDATION REQUIREMENTS:**

**Manual Test 1: Simulate Truncated Response**

```typescript
// File: scripts/test-truncation-fail-fast.ts
import { ConversationGenerationService } from '../src/lib/services/conversation-generation-service';
import { getClaudeAPIClient } from '../src/lib/services/claude-api-client';

// Mock Claude client to return truncated response
class MockClaudeClient {
  async generateConversation(prompt: string, config: any) {
    return {
      id: 'test-truncated',
      content: 'This is a truncated response \\',  // Ends with backslash!
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'end_turn',  // Unexpected with truncation
      usage: { input_tokens: 500, output_tokens: 200 },
      cost: 0.01,
      durationMs: 1000,
    };
  }
}

(async () => {
  console.log('Testing fail-fast behavior with truncated response...\n');

  const mockClient = new MockClaudeClient() as any;
  const service = new ConversationGenerationService(mockClient);

  try {
    await service.generateSingleConversation({
      templateId: 'test-template',
      parameters: { persona: 'Test', emotion: 'Anxious' },
      tier: 'template',
      userId: '00000000-0000-0000-0000-000000000000',
    });

    console.error('❌ FAIL: Should have thrown TruncatedResponseError');
    process.exit(1);
  } catch (error: any) {
    if (error.name === 'TruncatedResponseError') {
      console.log('✅ PASS: Truncation detected and error thrown');
      console.log('Pattern:', error.pattern);
      console.log('Message:', error.message);
      
      // Verify stored as failed generation
      const failedGenService = require('../src/lib/services/failed-generation-service').getFailedGenerationService();
      const failures = await failedGenService.listFailedGenerations({ failure_type: 'truncation' }, { limit: 1 });
      
      if (failures.total > 0) {
        console.log('✅ PASS: Failed generation stored');
        console.log('Failure ID:', failures.failures[0].id);
      } else {
        console.error('❌ FAIL: Failed generation not stored');
        process.exit(1);
      }
    } else {
      console.error('❌ FAIL: Wrong error type:', error.name);
      process.exit(1);
    }
  }
})();
```

Run: `npx tsx scripts/test-truncation-fail-fast.ts`

Expected output:
```
Testing fail-fast behavior with truncated response...

[req_...] Validating API response...
[req_...] ⚠️ Content appears truncated: Ends with lone backslash
[req_...] ❌ Response validation failed: TruncatedResponseError
[req_...] Storing as failed generation...
[FailedGenerationService] ✅ Stored failed generation abc-123

✅ PASS: Truncation detected and error thrown
Pattern: lone_backslash
Message: Generation failed: content truncated (lone_backslash)
✅ PASS: Failed generation stored
Failure ID: abc-123...
```

---

**Manual Test 2: Verify Production Storage Protection**

```typescript
// File: scripts/test-production-protection.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  console.log('Testing production storage protection...\n');

  // Run truncation test (from Test 1)
  // ... (same mock test as above)

  // After test, verify NO record in conversations table
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('conversation_id', 'test-truncated')
    .maybeSingle();

  if (error) {
    console.error('Error querying conversations:', error);
    process.exit(1);
  }

  if (conversations === null) {
    console.log('✅ PASS: NO record in conversations table (protected)');
  } else {
    console.error('❌ FAIL: Truncated conversation was stored in production!');
    console.error('Record:', conversations);
    process.exit(1);
  }

  // Verify record IS in failed_generations table
  const { data: failures, error: failError } = await supabase
    .from('failed_generations')
    .select('*')
    .eq('failure_type', 'truncation')
    .order('created_at', { ascending: false })
    .limit(1);

  if (failError) {
    console.error('Error querying failed_generations:', failError);
    process.exit(1);
  }

  if (failures && failures.length > 0) {
    console.log('✅ PASS: Record found in failed_generations table');
    console.log('Failure Type:', failures[0].failure_type);
    console.log('Pattern:', failures[0].truncation_pattern);
  } else {
    console.error('❌ FAIL: Failed generation not stored in failed_generations table');
    process.exit(1);
  }

  console.log('\n✅ All protection tests passed!');
})();
```

Run: `npx tsx scripts/test-production-protection.ts`

Expected output:
```
✅ PASS: NO record in conversations table (protected)
✅ PASS: Record found in failed_generations table
Failure Type: truncation
Pattern: lone_backslash

✅ All protection tests passed!
```

---

**Manual Test 3: Verify Batch Resilience**

```typescript
// File: scripts/test-batch-resilience.ts
import { BatchGenerationService } from '../src/lib/services/batch-generation-service';

// Test that batch continues after individual failure

(async () => {
  console.log('Testing batch resilience...\n');

  const batchService = new BatchGenerationService();

  // Create batch with mix of valid and invalid tasks
  const tasks = [
    { /* Valid task 1 */ },
    { /* Task that will truncate */ },
    { /* Valid task 2 */ },
  ];

  const result = await batchService.generateBatch({
    tasks,
    userId: '00000000-0000-0000-0000-000000000000',
  });

  console.log('Batch Results:');
  console.log('Total:', result.total);
  console.log('Success:', result.successCount);
  console.log('Failed:', result.failureCount);

  if (result.successCount === 2 && result.failureCount === 1) {
    console.log('\n✅ PASS: Batch continued after individual failure');
  } else {
    console.error('\n❌ FAIL: Batch did not handle failures correctly');
    process.exit(1);
  }
})();
```

Run: `npx tsx scripts/test-batch-resilience.ts`

Expected output:
```
Testing batch resilience...

[Batch abc-123] Failed conversation xyz: TruncatedResponseError
[Batch abc-123] Failed generation already stored for analysis
[Batch abc-123] Continuing to next conversation...

Batch Results:
Total: 3
Success: 2
Failed: 1

✅ PASS: Batch continued after individual failure
```

---

**DELIVERABLES:**

1. **Modified Files**:
   - ✅ `src/lib/services/conversation-generation-service.ts` - Validation and fail-fast logic
   - ✅ `src/lib/services/batch-generation-service.ts` - Error handling (if batch jobs exist)

2. **New Methods**:
   - ✅ `validateAPIResponse()` - Response validation
   - ✅ `storeFailedGeneration()` - Failed generation storage
   - ✅ Custom error classes (TruncatedResponseError, UnexpectedStopReasonError)

3. **Test Scripts**:
   - ✅ `scripts/test-truncation-fail-fast.ts` - Fail-fast behavior
   - ✅ `scripts/test-production-protection.ts` - Storage protection
   - ✅ `scripts/test-batch-resilience.ts` - Batch continuity

4. **Integration**:
   - ✅ Validation occurs BEFORE production storage
   - ✅ Failed generations stored with full diagnostics
   - ✅ Production pipeline protected from bad data
   - ✅ Batch jobs resilient to individual failures

Implement this integration layer completely, ensuring all test scripts pass and production data quality is protected.

++++++++++++++++++

---

### Prompt 3: Visibility Layer - Failed Generations UI

**Scope**: Create UI for viewing failed generations, error report modal, filtering, and RAW file download  
**Dependencies**: Prompts 1-2 (FailedGenerationService working, data being stored), existing Next.js dashboard  
**Estimated Time**: 6-8 hours  
**Risk Level**: Low (pure UI implementation)

========================

You are a senior full-stack developer implementing the Visibility Layer UI for the Failed Generation Storage & Visibility System for the BrightHub BRun LoRA Training Data Platform.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
In Prompts 1-2, we built the backend infrastructure to detect and store failed generations. Now we create the UI so developers can view failure patterns, analyze errors, and download RAW Error File Reports.

**Functional Requirements Being Implemented:**
- **FR-VIEW-FAILURES**: Display list of failed generations with key metadata
- **FR-FILTER-FAILURES**: Filter by failure_type, stop_reason, truncation_pattern, date
- **FR-VIEW-DETAILS**: Modal showing complete error report with analysis
- **FR-DOWNLOAD-RAW**: Download RAW Error File Report JSON for deep investigation

**Acceptance Criteria:**
1. New page `/conversations/failed` accessible from navigation
2. Table showing: date, failure_type, stop_reason, pattern, output_tokens, actions
3. Filter controls: failure_type, stop_reason, truncation_pattern, date range
4. Click row to open error report modal with full diagnostics
5. Download button for RAW Error File Report JSON
6. Responsive design (works on 1366x768 and 1920x1080)
7. Keyboard accessible (Tab, Enter, Esc navigation)

**Technical Architecture:**
- Next.js 14 App Router page component
- Shadcn/UI components (Table, Dialog, Badge, Button, Select)
- React hooks for state management
- Supabase client for data fetching
- File download via browser download API

---

**CURRENT CODEBASE STATE:**

**Existing Dashboard Structure**:
- `src/app/(dashboard)/conversations/page.tsx` - Existing conversations list
- `src/app/(dashboard)/layout.tsx` - Dashboard layout with navigation
- Use existing patterns for table, filters, modals

**Existing Components to Reference**:
- Table components in `conversations/page.tsx`
- Filter patterns in same file
- Modal patterns using Shadcn/UI Dialog

---

**IMPLEMENTATION TASKS:**

**Task 3.1: Create Failed Generations Page**

Create `src/app/(dashboard)/conversations/failed/page.tsx`:

```typescript
/**
 * Failed Generations Page
 * 
 * Displays list of failed conversation generations with filtering,
 * detailed error reports, and RAW file download capabilities.
 */

'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { getFailedGenerationService, type FailedGeneration } from '@/lib/services/failed-generation-service';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Eye, Filter } from 'lucide-react';
import { ErrorReportModal } from '@/components/failed-generations/error-report-modal';

export default function FailedGenerationsPage() {
  const [failures, setFailures] = useState<FailedGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedFailure, setSelectedFailure] = useState<FailedGeneration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [failureTypeFilter, setFailureTypeFilter] = useState<string>('all');
  const [stopReasonFilter, setStopReasonFilter] = useState<string>('all');
  const [patternFilter, setPatternFilter] = useState<string>('all');

  const limit = 25;

  useEffect(() => {
    loadFailures();
  }, [page, failureTypeFilter, stopReasonFilter, patternFilter]);

  async function loadFailures() {
    setLoading(true);
    try {
      const service = getFailedGenerationService();

      const filters: any = {};
      if (failureTypeFilter !== 'all') filters.failure_type = failureTypeFilter;
      if (stopReasonFilter !== 'all') filters.stop_reason = stopReasonFilter;
      if (patternFilter !== 'all') filters.truncation_pattern = patternFilter;

      const result = await service.listFailedGenerations(filters, { page, limit });

      setFailures(result.failures);
      setTotalCount(result.total);
    } catch (error) {
      console.error('Error loading failed generations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadRawReport(failure: FailedGeneration) {
    try {
      const service = getFailedGenerationService();
      const report = await service.downloadErrorReport(failure.id);

      if (!report) {
        alert('Error report file not found');
        return;
      }

      // Create download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `failed-generation-${failure.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download error report');
    }
  }

  function handleViewDetails(failure: FailedGeneration) {
    setSelectedFailure(failure);
    setIsModalOpen(true);
  }

  function getFailureTypeBadge(type: string) {
    const colors = {
      truncation: 'destructive',
      parse_error: 'warning',
      api_error: 'secondary',
      validation_error: 'default',
    };
    return colors[type as keyof typeof colors] || 'default';
  }

  function getStopReasonBadge(stopReason: string | null) {
    if (!stopReason) return <Badge variant="outline">NULL</Badge>;
    if (stopReason === 'end_turn') return <Badge variant="default">end_turn</Badge>;
    if (stopReason === 'max_tokens') return <Badge variant="destructive">max_tokens</Badge>;
    return <Badge variant="secondary">{stopReason}</Badge>;
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-destructive" />
                Failed Generations
              </CardTitle>
              <CardDescription>
                Diagnostic view of failed conversation generations ({totalCount} total failures)
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={failureTypeFilter} onValueChange={setFailureTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Failure Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="truncation">Truncation</SelectItem>
                <SelectItem value="parse_error">Parse Error</SelectItem>
                <SelectItem value="api_error">API Error</SelectItem>
                <SelectItem value="validation_error">Validation Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stopReasonFilter} onValueChange={setStopReasonFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stop Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stop Reasons</SelectItem>
                <SelectItem value="end_turn">end_turn</SelectItem>
                <SelectItem value="max_tokens">max_tokens</SelectItem>
                <SelectItem value="stop_sequence">stop_sequence</SelectItem>
                <SelectItem value="tool_use">tool_use</SelectItem>
              </SelectContent>
            </Select>

            <Select value={patternFilter} onValueChange={setPatternFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Truncation Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                <SelectItem value="lone_backslash">Lone Backslash</SelectItem>
                <SelectItem value="escaped_quote">Escaped Quote</SelectItem>
                <SelectItem value="mid_word">Mid-Word</SelectItem>
                <SelectItem value="trailing_comma">Trailing Comma</SelectItem>
                <SelectItem value="no_punctuation">No Punctuation</SelectItem>
              </SelectContent>
            </Select>

            {(failureTypeFilter !== 'all' || stopReasonFilter !== 'all' || patternFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFailureTypeFilter('all');
                  setStopReasonFilter('all');
                  setPatternFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading failed generations...</div>
          ) : failures.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No failed generations found. {failureTypeFilter !== 'all' || stopReasonFilter !== 'all' || patternFilter !== 'all' ? 'Try adjusting filters.' : ''}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Failure Type</TableHead>
                    <TableHead>Stop Reason</TableHead>
                    <TableHead>Pattern</TableHead>
                    <TableHead>Tokens</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failures.map((failure) => (
                    <TableRow key={failure.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {new Date(failure.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getFailureTypeBadge(failure.failure_type) as any}>
                          {failure.failure_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStopReasonBadge(failure.stop_reason)}
                      </TableCell>
                      <TableCell>
                        {failure.truncation_pattern ? (
                          <Badge variant="outline">{failure.truncation_pattern}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {failure.output_tokens || 0} / {failure.max_tokens}
                      </TableCell>
                      <TableCell className="text-sm">{failure.model}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(failure)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadRawReport(failure)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            RAW
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} failures
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Error Report Modal */}
      <ErrorReportModal
        failure={selectedFailure}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
```

---

**Task 3.2: Create Error Report Modal Component**

Create `src/components/failed-generations/error-report-modal.tsx`:

```typescript
/**
 * Error Report Modal
 * 
 * Displays comprehensive diagnostic information for a failed generation
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Download, Copy, Check } from 'lucide-react';
import { getFailedGenerationService, type FailedGeneration, type ErrorFileReport } from '@/lib/services/failed-generation-service';

interface ErrorReportModalProps {
  failure: FailedGeneration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErrorReportModal({ failure, open, onOpenChange }: ErrorReportModalProps) {
  const [report, setReport] = useState<ErrorFileReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && failure) {
      loadReport();
    }
  }, [open, failure]);

  async function loadReport() {
    if (!failure) return;

    setLoading(true);
    try {
      const service = getFailedGenerationService();
      const data = await service.downloadErrorReport(failure.id);
      setReport(data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyContent() {
    if (!failure) return;
    navigator.clipboard.writeText(failure.response_content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadFull() {
    if (!report || !failure) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-generation-${failure.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!failure) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Failed Generation Diagnostic Report
          </DialogTitle>
          <DialogDescription>
            Complete error analysis and raw response data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Failure Type:</span>
                <Badge variant="destructive" className="ml-2">{failure.failure_type}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Stop Reason:</span>
                <Badge className="ml-2">{failure.stop_reason || 'NULL'}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Pattern:</span>
                <Badge variant="outline" className="ml-2">{failure.truncation_pattern || 'N/A'}</Badge>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Model:</span>
                <span className="ml-2 text-sm font-mono">{failure.model}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Token Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Token Analysis</h3>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Input Tokens:</span>
                <span className="text-sm font-mono">{failure.input_tokens || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Output Tokens:</span>
                <span className="text-sm font-mono">{failure.output_tokens || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Max Tokens Configured:</span>
                <span className="text-sm font-mono">{failure.max_tokens}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tokens Remaining:</span>
                <span className="text-sm font-mono">{failure.max_tokens - (failure.output_tokens || 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold">
                <span className="text-sm">Token Utilization:</span>
                <span className="text-sm font-mono">
                  {((failure.output_tokens || 0) / failure.max_tokens * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Error Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Error Details</h3>
            {failure.truncation_details && (
              <div className="mb-3">
                <span className="text-sm font-medium text-muted-foreground">Truncation Details:</span>
                <p className="text-sm mt-1 p-3 bg-muted rounded-md">{failure.truncation_details}</p>
              </div>
            )}
            {failure.error_message && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Error Message:</span>
                <p className="text-sm mt-1 p-3 bg-destructive/10 text-destructive rounded-md font-mono">
                  {failure.error_message}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Response Content Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Response Content (truncated)</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
              >
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                {failure.response_content || 'No content available'}
              </pre>
            </div>
            {failure.response_content && failure.response_content.length > 1000 && (
              <p className="text-xs text-muted-foreground mt-2">
                Showing preview only. Download full RAW report for complete content.
              </p>
            )}
          </div>

          <Separator />

          {/* Analysis Section */}
          {report && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Automated Analysis</h3>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Stop Reason Analysis:</span>{' '}
                  {report.error_report.stop_reason_analysis}
                </p>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  <span className="font-bold">Conclusion:</span>{' '}
                  {report.error_report.analysis.conclusion}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleDownloadFull}>
              <Download className="h-4 w-4 mr-2" />
              Download Full RAW Report
            </Button>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

---

**Task 3.3: Add Navigation Link**

File: `src/app/(dashboard)/layout.tsx`

Find the navigation links section and add:

```typescript
// Inside navigation menu
<Link
  href="/conversations/failed"
  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
>
  <AlertCircle className="h-4 w-4" />
  Failed Generations
</Link>
```

---

**ACCEPTANCE CRITERIA:**

1. **Page Implementation**:
   - ✅ `/conversations/failed` page exists and renders
   - ✅ Table displays failed generations with all required columns
   - ✅ Pagination works (Previous/Next buttons)
   - ✅ Loading state while fetching data

2. **Filtering**:
   - ✅ Filter by failure_type (dropdown)
   - ✅ Filter by stop_reason (dropdown)
   - ✅ Filter by truncation_pattern (dropdown)
   - ✅ "Clear Filters" button resets all filters
   - ✅ Filters trigger data reload

3. **Error Report Modal**:
   - ✅ Modal opens when "View" button clicked
   - ✅ Displays summary, token analysis, error details, content preview
   - ✅ "Copy" button copies content to clipboard
   - ✅ "Download Full RAW Report" downloads JSON file
   - ✅ Keyboard accessible (Esc to close)

4. **RAW Download**:
   - ✅ "RAW" button in table downloads error report
   - ✅ Downloaded file named `failed-generation-{id}.json`
   - ✅ JSON is valid and contains complete error report structure

5. **UI/UX**:
   - ✅ Responsive design (works on 1366x768 and 1920x1080)
   - ✅ Proper badge colors (destructive for truncation, etc.)
   - ✅ Loading states and empty states
   - ✅ Error handling for download failures

6. **Navigation**:
   - ✅ Link in dashboard navigation menu
   - ✅ Link highlighted when on failed page
   - ✅ Icon (AlertCircle) for visual distinction

---

**VALIDATION REQUIREMENTS:**

**Manual Test 1: Page Rendering**

1. Navigate to `http://localhost:3000/conversations/failed`
2. Verify page loads without errors
3. Verify table shows failed generations
4. Verify columns: Date, Failure Type, Stop Reason, Pattern, Tokens, Model, Actions

Expected: Table renders with sample data, pagination controls visible if >25 records

---

**Manual Test 2: Filtering**

1. Select "truncation" from Failure Type filter
2. Verify table updates to show only truncation failures
3. Select "end_turn" from Stop Reason filter
4. Verify table further filtered
5. Click "Clear Filters"
6. Verify all filters reset to "All"

Expected: Filters work correctly, table updates, counts accurate

---

**Manual Test 3: Error Report Modal**

1. Click "View" button on any row
2. Verify modal opens
3. Verify displays: Summary, Token Analysis, Error Details, Content Preview
4. Click "Copy" button
5. Paste in text editor - verify content matches
6. Click "Download Full RAW Report"
7. Verify JSON file downloads
8. Open JSON - verify structure matches ErrorFileReport type

Expected: Modal displays all data, buttons work, download successful

---

**Manual Test 4: RAW Download from Table**

1. Click "RAW" button on any row
2. Verify JSON file downloads immediately
3. Open file - verify contains complete error report
4. Check file name format: `failed-generation-{uuid}.json`

Expected: Direct download works, file is valid JSON

---

**Manual Test 5: Keyboard Accessibility**

1. Tab through page elements
2. Verify focus indicators visible
3. Press Enter on "View" button (should open modal)
4. Press Esc in modal (should close)
5. Tab through filter dropdowns

Expected: All interactive elements keyboard accessible

---

**Manual Test 6: Responsive Design**

1. Resize browser to 1366x768
2. Verify table fits, no horizontal scroll
3. Verify modal not cut off
4. Resize to 1920x1080
5. Verify layout looks good

Expected: UI adapts to different screen sizes

---

**DELIVERABLES:**

1. **New Files**:
   - ✅ `src/app/(dashboard)/conversations/failed/page.tsx` - Main page
   - ✅ `src/components/failed-generations/error-report-modal.tsx` - Modal component

2. **Modified Files**:
   - ✅ `src/app/(dashboard)/layout.tsx` - Navigation link added

3. **UI Components Used**:
   - ✅ Shadcn/UI: Table, Badge, Button, Select, Dialog, Card, Separator
   - ✅ Lucide icons: AlertCircle, Download, Eye, Filter, Copy, Check

4. **Functionality**:
   - ✅ List failed generations with pagination
   - ✅ Filter by failure_type, stop_reason, pattern
   - ✅ View detailed error report in modal
   - ✅ Download RAW Error File Report JSON
   - ✅ Copy content to clipboard

5. **Testing Evidence**:
   - ✅ Screenshots showing page, table, filters
   - ✅ Screenshot of error report modal
   - ✅ Sample downloaded JSON file
   - ✅ Keyboard navigation test results

Implement this UI layer completely, ensuring all acceptance criteria are met and the interface is intuitive for diagnosing failed generations.

++++++++++++++++++

---

## Quality Validation Checklist

### Post-Implementation Verification

After completing all 3 prompts, verify the following:

#### Functional Completeness

**Prompt 1 (Foundation)**:
- [ ] `stop_reason` captured on every Claude API call and logged
- [ ] `failed_generations` table exists with all columns, indexes, RLS
- [ ] FailedGenerationService CRUD operations working
- [ ] Truncation detection identifies all patterns
- [ ] RAW Error File Report uploads to storage

**Prompt 2 (Integration)**:
- [ ] Validation runs after Claude API, before production storage
- [ ] Truncated responses do NOT enter `conversations` table
- [ ] Failed generations stored in `failed_generations` table
- [ ] Batch jobs continue after individual failure
- [ ] Error messages are descriptive

**Prompt 3 (UI)**:
- [ ] `/conversations/failed` page accessible and renders
- [ ] Table displays failed generations with filtering
- [ ] Error report modal shows complete diagnostics
- [ ] RAW report download works
- [ ] Keyboard navigation functional

#### Integration Verification

**End-to-End Test**:
1. Generate conversation with truncated response
2. Verify validation detects truncation
3. Verify failed generation stored in database
4. Verify NOT stored in conversations table
5. Navigate to `/conversations/failed` page
6. Verify failure appears in table
7. View error report modal
8. Download RAW report JSON
9. Verify JSON contains complete diagnostic data

**Expected Flow**:
```
Claude API (stop_reason captured) →
Validation (detects truncation) →
Store Failed Generation (RAW report + DB record) →
Throw Error (prevent production storage) →
UI (view failure in dashboard)
```

#### Performance Requirements

- [ ] Generation speed unchanged (validation adds <50ms)
- [ ] Failed generations page loads in <2s with 100 records
- [ ] Modal opens instantly (<100ms)
- [ ] RAW download completes in <1s for typical file size

#### Data Quality

**Database Checks** (use SAOL):

```sql
-- Verify failed_generations table populated
SELECT COUNT(*) as total_failures FROM failed_generations;

-- Check stop_reason distribution
SELECT stop_reason, COUNT(*) as count
FROM failed_generations
GROUP BY stop_reason
ORDER BY count DESC;

-- Check truncation patterns
SELECT truncation_pattern, COUNT(*) as count
FROM failed_generations
WHERE truncation_pattern IS NOT NULL
GROUP BY truncation_pattern
ORDER BY count DESC;

-- Verify NO truncated content in production
SELECT COUNT(*) as should_be_zero
FROM conversations
WHERE status = 'generated'
AND parse_error IS NOT NULL;
```

#### Security Considerations

- [ ] RLS policies prevent cross-user access to failed generations
- [ ] Storage bucket requires authentication
- [ ] No sensitive data logged to console in production
- [ ] Error messages don't expose internal system details

#### Code Quality

- [ ] All TypeScript strict mode checks pass
- [ ] JSDoc comments on all public APIs
- [ ] Error handling with try-catch on all async operations
- [ ] Console logging for debugging (not console.error for info)
- [ ] No use of `any` except for JSONB fields

#### User Experience

- [ ] Loading indicators during async operations
- [ ] Empty states when no failures found
- [ ] Clear error messages for download failures
- [ ] Confirmation feedback (e.g., "Copied" button state)
- [ ] Responsive design on common screen sizes

---

## Next Steps After Implementation

### Immediate Actions

1. **Monitor Failure Patterns**: Review `/conversations/failed` page daily for first week
2. **Analyze stop_reason Distribution**: Determine if `max_tokens` or `end_turn` is primary cause
3. **Pattern Analysis**: Identify most common truncation patterns
4. **Root Cause Investigation**: Use captured data to diagnose why truncation occurs

### Follow-Up Tasks

**If stop_reason === 'max_tokens'**:
- Increase `max_tokens` configuration
- Add dynamic token allocation based on prompt length
- Implement continuation strategy for long responses

**If stop_reason === 'end_turn' but content truncated**:
- Report bug to Anthropic (structured outputs beta issue)
- Investigate network/streaming issues
- Consider disabling structured outputs temporarily

**If pattern is consistent**:
- Add pre-flight validation to prompt templates
- Adjust temperature or other generation parameters
- Implement automatic retry with modified parameters

### Monitoring and Alerting

**Metrics to Track**:
- Failed generation rate (target: <5% of total)
- Most common stop_reason
- Most common truncation_pattern
- Average output_tokens on failures vs successes

**Alerts to Set**:
- Failure rate >10% (investigate immediately)
- New truncation pattern detected
- Storage bucket nearing capacity

### Documentation Updates

After patterns emerge, update:
- `docs/TROUBLESHOOTING.md` with common failure modes
- `docs/GENERATION_BEST_PRACTICES.md` with prevention strategies
- This execution plan with lessons learned

---

## Implementation Summary

**Total Prompts**: 3  
**Estimated Total Time**: 18-24 hours  
**Priority**: CRITICAL

**Prompt Breakdown:**
1. **Prompt 1** (6-8h): stop_reason capture + database + service layer
2. **Prompt 2** (6-8h): Fail-fast integration + validation
3. **Prompt 3** (6-8h): UI for viewing failures

**Critical Success Factors:**
- `stop_reason` captured on EVERY Claude API call
- Truncated responses NEVER enter `conversations` table
- Failed generations always stored with complete diagnostics
- UI provides actionable insights for debugging

**Quality Gates:**
- All TypeScript strict mode checks pass
- All test scripts execute successfully
- End-to-end test passes (generate → detect → store → view)
- No production data quality degradation

This execution plan provides complete, implementable instructions for building the Failed Generation Storage & Visibility System using Claude-4.5-sonnet in 200k token context windows. Each prompt is self-contained, includes comprehensive context, and specifies exact acceptance criteria and validation procedures.

---

**End of Implementation Execution Instructions**

**Document Version**: v5  
**Created**: 2025-12-02  
**Purpose**: Implement truncation detection and failed generation reporting system

