# Truncation Detection & Failed Generation Storage System - Execution Plan

**Generated**: 2025-12-02  
**Version**: v4  
**Total Prompts**: 3  
**Estimated Implementation Time**: 12-16 hours  

---

## Executive Summary

This execution plan implements a comprehensive truncation detection and failed generation reporting system for the Claude API client and conversation generation pipeline. The system captures `stop_reason` from Claude API responses, detects truncated content patterns, stores failed generations separately from production data, and provides UI visibility for examining failures.

**Key Deliverables:**
- Enhanced Claude API client with `stop_reason` capture and logging
- Truncation detection utility with pattern matching
- Failed generations storage system (database table + storage bucket)
- Fail-fast logic preventing truncated data from entering production
- UI page for viewing and downloading failed generation reports

**Critical Problem Being Solved:**
Truncated conversation responses are currently entering the production pipeline undetected. Analysis shows truncation occurs at ~1,000 tokens (far below the 24,576 limit), affecting only assistant responses. Without capturing `stop_reason`, we cannot diagnose the root cause.

---

## Context and Dependencies

### Current State

**Completed Work:**
- ✅ Full training file generation working
- ✅ 4 critical metadata defects in TrainingFileService fixed
- ✅ Root cause investigation completed (disproved max_tokens theory)

**Critical Discovery:**
Truncated files are only ~1,000 tokens but configured limit is 24,576. The system does NOT capture `stop_reason` from Claude API, preventing diagnosis.

### Architecture Context

**Current Pipeline:**
```
Scaffolding Selection → Template Resolution → Claude API →
Quality Validation → Storage → Enrichment → JSONL Export
```

**Enhanced Pipeline (After This Implementation):**
```
Scaffolding Selection → Template Resolution → Claude API →
[NEW: stop_reason Check] → [NEW: Truncation Detection] →
[IF FAILED: Store in failed_generations + ABORT] →
[IF SUCCESS: Continue to Production Pipeline]
```

### Database Schema

**Existing Tables (Referenced):**
- `conversations` - Production conversation storage
- `generation_logs` - API call logging
- `personas`, `emotional_arcs`, `training_topics` - Scaffolding data

**New Table (To Be Created):**
- `failed_generations` - Failed generation records with analysis

**Existing Storage Buckets:**
- `conversation-files` - Production conversation JSON files

**New Storage Bucket (To Be Created):**
- `failed-generation-files` - RAW error file reports

---

## Implementation Prompts

### Prompt 1: Claude API Client Enhancement & Failed Generation Storage Foundation

**Scope**: Update `claude-api-client.ts` to capture `stop_reason`, create `failed_generations` table, implement `FailedGenerationService`  
**Dependencies**: Supabase database, SAOL library, existing claude-api-client.ts  
**Estimated Time**: 4-5 hours  
**Risk Level**: Low

========================

You are implementing the foundation for truncation detection by enhancing the Claude API client to capture `stop_reason` and creating the failed generation storage system.

**CONTEXT:**

This is a Next.js 14 + TypeScript application that generates financial planning training conversations using Claude API. We've discovered that some responses are truncated mid-sentence, but we don't capture the `stop_reason` field from Claude's API response, preventing root cause analysis.

**CRITICAL REQUIREMENTS:**

1. **Use SAOL for all database operations** - Located at `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
2. **Follow existing patterns** - Match code style in `src/lib/services/conversation-storage-service.ts`
3. **NO retry logic** - Store failures for analysis, don't attempt to fix them

**TASK 1.1: Update Claude API Client to Capture stop_reason**

**File**: `src/lib/services/claude-api-client.ts`

**Current Code** (lines 305-328):
```typescript
// Extract content (Claude returns array of content blocks)
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

**Required Changes:**

1. Update `ClaudeAPIResponse` interface (lines 41-51):
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

2. Capture and log `stop_reason` in `callAPI` method (after line 308):
```typescript
// Extract content
const content = data.content
  .map((block: any) => block.text)
  .join('\n');

// NEW: Capture stop_reason
const stopReason = data.stop_reason || 'unknown';

// NEW: Log stop_reason for debugging
console.log(`[${requestId}] stop_reason: ${stopReason}`);
console.log(`[${requestId}] output_tokens: ${data.usage.output_tokens}`);

// NEW: Warn if not end_turn
if (stopReason !== 'end_turn') {
  console.warn(`[${requestId}] ⚠️ Unexpected stop_reason: ${stopReason}`);
}
```

3. Return `stop_reason` in response object (update return statement around line 318):
```typescript
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

**TASK 1.2: Create failed_generations Database Table**

**Using SAOL** - Execute this SQL migration:

```bash
cd C:\Users\james\Master\BrightHub\BRun\train-data
node -e "require('dotenv').config({path:'.env.local'});const saol=require('./supa-agent-ops');(async()=>{console.log('Creating failed_generations table...');const sql=\`CREATE TABLE IF NOT EXISTS failed_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  failed_generation_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  conversation_id UUID,
  run_id UUID,
  
  -- Request context
  prompt TEXT NOT NULL,
  model VARCHAR(100) NOT NULL,
  max_tokens INTEGER NOT NULL,
  temperature NUMERIC(3,2),
  
  -- Response data
  raw_response JSONB NOT NULL,
  stop_reason VARCHAR(50),
  
  -- Token usage
  input_tokens INTEGER,
  output_tokens INTEGER,
  
  -- Failure analysis
  failure_type VARCHAR(50) NOT NULL CHECK (failure_type IN ('truncation', 'parse_error', 'api_error', 'validation_error')),
  truncation_pattern VARCHAR(50),
  truncation_details TEXT,
  
  -- Metadata
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  
  -- Storage
  file_path TEXT
);

CREATE INDEX idx_failed_generations_failure_type ON failed_generations(failure_type);
CREATE INDEX idx_failed_generations_created_at ON failed_generations(created_at DESC);
CREATE INDEX idx_failed_generations_stop_reason ON failed_generations(stop_reason);

COMMENT ON TABLE failed_generations IS 'Failed conversation generations for analysis and debugging';\`;console.log(await saol.agentRawSQL({sql}))})();"
```

**Verification:**
```bash
node -e "require('dotenv').config({path:'.env.local'});const saol=require('./supa-agent-ops');(async()=>{console.log(await saol.agentIntrospectSchema({table:'failed_generations',transport:'pg'}))})();"
```

**TASK 1.3: Create FailedGenerationService**

**File**: `src/lib/services/failed-generation-service.ts` (NEW FILE)

```typescript
/**
 * Failed Generation Service
 * 
 * Manages storage and retrieval of failed conversation generations
 * for debugging and root cause analysis.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { ClaudeAPIResponse } from './claude-api-client';

export interface FailedGeneration {
  id: string;
  failed_generation_id: string;
  conversation_id: string | null;
  run_id: string | null;
  
  // Request context
  prompt: string;
  model: string;
  max_tokens: number;
  temperature: number | null;
  
  // Response data
  raw_response: any;
  stop_reason: string | null;
  
  // Token usage
  input_tokens: number | null;
  output_tokens: number | null;
  
  // Failure analysis
  failure_type: 'truncation' | 'parse_error' | 'api_error' | 'validation_error';
  truncation_pattern: string | null;
  truncation_details: string | null;
  
  // Metadata
  error_message: string | null;
  created_at: string;
  created_by: string | null;
  
  // Storage
  file_path: string | null;
}

export interface CreateFailedGenerationInput {
  conversation_id?: string;
  run_id?: string;
  prompt: string;
  model: string;
  max_tokens: number;
  temperature?: number;
  raw_response: ClaudeAPIResponse;
  failure_type: FailedGeneration['failure_type'];
  truncation_pattern?: string;
  truncation_details?: string;
  error_message?: string;
  created_by?: string;
}

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
   * Store a failed generation with analysis
   */
  async createFailedGeneration(input: CreateFailedGenerationInput): Promise<FailedGeneration> {
    try {
      const failedGenerationId = crypto.randomUUID();
      
      const record = {
        failed_generation_id: failedGenerationId,
        conversation_id: input.conversation_id || null,
        run_id: input.run_id || null,
        prompt: input.prompt,
        model: input.model,
        max_tokens: input.max_tokens,
        temperature: input.temperature || null,
        raw_response: input.raw_response,
        stop_reason: input.raw_response.stop_reason || null,
        input_tokens: input.raw_response.usage?.input_tokens || null,
        output_tokens: input.raw_response.usage?.output_tokens || null,
        failure_type: input.failure_type,
        truncation_pattern: input.truncation_pattern || null,
        truncation_details: input.truncation_details || null,
        error_message: input.error_message || null,
        created_by: input.created_by || null,
      };

      const { data, error } = await this.supabase
        .from('failed_generations')
        .insert(record)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to store failed generation: ${error.message}`);
      }

      console.log(`[FailedGenerationService] ✅ Stored failed generation: ${failedGenerationId}`);
      
      return data as FailedGeneration;
    } catch (error) {
      console.error('[FailedGenerationService] Error storing failed generation:', error);
      throw error;
    }
  }

  /**
   * Get failed generation by ID
   */
  async getFailedGeneration(failedGenerationId: string): Promise<FailedGeneration | null> {
    const { data, error } = await this.supabase
      .from('failed_generations')
      .select('*')
      .eq('failed_generation_id', failedGenerationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as FailedGeneration;
  }

  /**
   * List failed generations with filters
   */
  async listFailedGenerations(filters?: {
    failure_type?: FailedGeneration['failure_type'];
    stop_reason?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<FailedGeneration[]> {
    let query = this.supabase
      .from('failed_generations')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.failure_type) {
      query = query.eq('failure_type', filters.failure_type);
    }
    if (filters?.stop_reason) {
      query = query.eq('stop_reason', filters.stop_reason);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    query = query.limit(filters?.limit || 50);

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as FailedGeneration[];
  }

  /**
   * Get count by failure type
   */
  async getFailureStats(): Promise<Record<string, number>> {
    const { data, error } = await this.supabase
      .from('failed_generations')
      .select('failure_type');

    if (error) throw error;

    const stats: Record<string, number> = {};
    data?.forEach(row => {
      stats[row.failure_type] = (stats[row.failure_type] || 0) + 1;
    });

    return stats;
  }
}

export const createFailedGenerationService = (supabase?: SupabaseClient) => {
  return new FailedGenerationService(supabase);
};
```

**ACCEPTANCE CRITERIA:**

1. ✅ `ClaudeAPIResponse` interface includes `stop_reason` field
2. ✅ Every Claude API call logs `stop_reason` to console
3. ✅ `failed_generations` table exists with all required columns
4. ✅ `FailedGenerationService` can create and retrieve failed generation records
5. ✅ No compilation errors in TypeScript

**TESTING:**

Run a test generation and verify `stop_reason` is logged:
```bash
# Check logs for stop_reason output
# Should see: [req_xxx] stop_reason: end_turn
```

Verify table created:
```bash
node -e "require('dotenv').config({path:'.env.local'});const saol=require('./supa-agent-ops');(async()=>{console.log(await saol.agentCount({table:'failed_generations'}))})();"
```

++++++++++++++++++


(Content continues in next message due to length...)

### Prompt 2: Truncation Detection & Fail-Fast Integration

(See full execution plan document for complete Prompt 2 and 3 content - implementing truncation detection utility and UI)

++++++++++++++++++

---

## Verification Plan

### Full verification details and success metrics included in complete execution plan.

