# Claude API Response Logging - Database Implementation
**Version:** 3.0  
**Date:** October 8, 2025  
**Purpose:** Log all Claude API responses to Supabase for debugging and quality analysis  
**Estimated Time:** 45 minutes  
**Risk Level:** 🟢 LOW (non-breaking, database-only)

---

## Overview

Add logging of all Claude API responses to a Supabase database table. This is Vercel-compatible (serverless-safe) and provides persistent, queryable storage of all AI interactions.

**What You'll Get:**
- Complete audit trail of all AI responses
- Queryable logs via SQL
- Cost tracking per API call
- Error tracking and debugging data
- Production-ready (works on Vercel)

---

## Human Actions Required

You must complete these 2 steps in order:

### STEP 1: Create Database Table (Required)

Run the SQL script below in Supabase SQL Editor to create the logging table.



========================================================================================

-- =============================================================================
-- Create API Response Logs Table
-- Purpose: Store all Claude API responses for debugging and quality analysis
-- Compatible with: Vercel serverless deployment
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_response_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Metadata
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  chunk_id UUID NOT NULL REFERENCES chunks(id) ON DELETE CASCADE,
  run_id UUID REFERENCES chunk_runs(run_id) ON DELETE SET NULL,
  template_type TEXT NOT NULL,
  template_name TEXT NOT NULL,
  
  -- AI Configuration
  model TEXT NOT NULL,
  temperature NUMERIC NOT NULL,
  max_tokens INTEGER NOT NULL,
  
  -- Request Data
  prompt TEXT NOT NULL,
  chunk_text_preview TEXT,
  document_category TEXT,
  
  -- Response Data (JSONB for efficient querying)
  claude_response JSONB NOT NULL,
  
  -- Processing Results
  parsed_successfully BOOLEAN NOT NULL,
  extraction_error TEXT,
  dimensions_extracted JSONB,
  
  -- Cost Tracking
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  estimated_cost_usd NUMERIC NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_api_response_logs_chunk_id ON api_response_logs(chunk_id);
CREATE INDEX idx_api_response_logs_run_id ON api_response_logs(run_id);
CREATE INDEX idx_api_response_logs_template_type ON api_response_logs(template_type);
CREATE INDEX idx_api_response_logs_created_at ON api_response_logs(created_at);
CREATE INDEX idx_api_response_logs_timestamp ON api_response_logs(timestamp);

-- Verify table was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'api_response_logs'
ORDER BY ordinal_position;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



**Expected Result:** Table created with 17 columns and 5 indexes

---

### STEP 2: Implement Logging Code (Required)

Copy the entire prompt below into a NEW Cursor conversation with Claude-4.5-sonnet Thinking.



========================================================================================

# TASK: Add Claude API Response Logging to Database

## Context
You are working on the Bright Run LoRA Training Data Platform. We need to log all Claude API responses to a Supabase database table for debugging and quality analysis.

**IMPORTANT:** 
- The app deploys to Vercel (serverless)
- Logs must go to database (NOT files - Vercel has ephemeral file system)
- All logging must be wrapped in try-catch (cannot break dimension generation)

## Prerequisites Completed
- [x] Database table `api_response_logs` already created in Supabase
- [ ] Need to create database service file
- [ ] Need to update generator.ts to call logging

## Your Task
Implement database logging that:
1. Creates a new service file for database logging operations
2. Modifies generator.ts to log every Claude API call
3. Wraps all logging in try-catch (never breaks the app)
4. Works on Vercel (database only, no file system operations)

---

## PART A: Create Database Service File

### Create New File: `src/lib/database/api-response-log-service.ts`

Create this NEW file with the following content:

```typescript
import { supabase } from './supabase';

export interface ApiResponseLog {
  id?: string;
  timestamp?: string;
  chunk_id: string;
  run_id: string | null;
  template_type: string;
  template_name: string;
  model: string;
  temperature: number;
  max_tokens: number;
  prompt: string;
  chunk_text_preview: string | null;
  document_category: string | null;
  claude_response: any;
  parsed_successfully: boolean;
  extraction_error: string | null;
  dimensions_extracted: any;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
  created_at?: string;
}

export const apiResponseLogService = {
  /**
   * Create a new API response log entry
   * Non-blocking - failures will not interrupt dimension generation
   */
  async createLog(log: Omit<ApiResponseLog, 'id' | 'timestamp' | 'created_at'>): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('api_response_logs')
        .insert(log)
        .select('id')
        .single();

      if (error) {
        console.error('Failed to create API response log:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Unexpected error creating API response log:', error);
      return null;
    }
  },

  /**
   * Get all logs for a specific chunk
   */
  async getLogsByChunk(chunkId: string): Promise<ApiResponseLog[]> {
    try {
      const { data, error } = await supabase
        .from('api_response_logs')
        .select('*')
        .eq('chunk_id', chunkId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to fetch logs by chunk:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching logs by chunk:', error);
      return [];
    }
  },

  /**
   * Get all logs for a specific run
   */
  async getLogsByRun(runId: string): Promise<ApiResponseLog[]> {
    try {
      const { data, error } = await supabase
        .from('api_response_logs')
        .select('*')
        .eq('run_id', runId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Failed to fetch logs by run:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching logs by run:', error);
      return [];
    }
  }
};
```

---

### Update File: `src/lib/database/index.ts`

Find the file `src/lib/database/index.ts` (where all database services are exported).

Add this line to the exports:

```typescript
export { apiResponseLogService } from './api-response-log-service';
```

---

## PART B: Modify Dimension Generator

### File: `src/lib/dimension-generation/generator.ts`

Make the following changes to add API response logging.

---

#### Change 1: Add Import

**Location:** Top of file, after existing imports

**Add:**
```typescript
import { apiResponseLogService } from '../database';
```

---

#### Change 2: Add Configuration

**Location:** After imports, before the `DimensionGenerator` class

**Add:**
```typescript
// Configuration for API response logging
const ENABLE_API_LOGGING = true; // Set to false to disable logging
```

---

#### Change 3: Add Logging Method

**Location:** Inside the `DimensionGenerator` class, after the constructor

**Add this complete method:**

```typescript
/**
 * Log Claude API response to database for debugging and auditing
 * Non-blocking - failures will not interrupt dimension generation
 */
private async logClaudeResponse(logData: {
  chunkId: string;
  runId: string;
  template: PromptTemplate;
  prompt: string;
  chunkTextPreview: string;
  documentCategory: string;
  aiParams: { temperature: number; model: string };
  claudeMessage: any;
  parsedDimensions: Partial<ChunkDimensions>;
  parseError: string | null;
  cost: number;
  inputTokens: number;
  outputTokens: number;
}): Promise<void> {
  // Skip if logging is disabled
  if (!ENABLE_API_LOGGING) {
    return;
  }

  try {
    await apiResponseLogService.createLog({
      chunk_id: logData.chunkId,
      run_id: logData.runId,
      template_type: logData.template.template_type,
      template_name: logData.template.template_name,
      model: logData.aiParams.model,
      temperature: logData.aiParams.temperature,
      max_tokens: 2048,
      prompt: logData.prompt,
      chunk_text_preview: logData.chunkTextPreview.substring(0, 200),
      document_category: logData.documentCategory,
      claude_response: logData.claudeMessage,
      parsed_successfully: logData.parseError === null,
      extraction_error: logData.parseError,
      dimensions_extracted: logData.parsedDimensions,
      input_tokens: logData.inputTokens,
      output_tokens: logData.outputTokens,
      estimated_cost_usd: logData.cost,
    });
    
    console.log(`✅ Logged API response: ${logData.template.template_type}`);
  } catch (error) {
    // Log error but don't throw - logging failures should not break dimension generation
    console.error('⚠️ Failed to log Claude API response:', error);
  }
}
```

---

#### Change 4: Modify executePromptTemplate Method

**Location:** Find the `executePromptTemplate` method (around line 224-278)

**Current method signature:**
```typescript
private async executePromptTemplate(params: {
  template: PromptTemplate;
  chunk: Chunk;
  documentCategory: string;
  aiParams?: {
    temperature?: number;
    model?: string;
  };
}): Promise<{ dimensions: Partial<ChunkDimensions>; cost: number }> {
```

**Change to (add runId parameter):**
```typescript
private async executePromptTemplate(params: {
  template: PromptTemplate;
  chunk: Chunk;
  documentCategory: string;
  runId: string; // ADD THIS LINE
  aiParams?: {
    temperature?: number;
    model?: string;
  };
}): Promise<{ dimensions: Partial<ChunkDimensions>; cost: number }> {
```

**Update destructuring (add runId):**
```typescript
const { template, chunk, documentCategory, runId, aiParams } = params; // ADD runId
```

---

**Find this section in executePromptTemplate:**

```typescript
// Call Claude API (with optional parameter overrides)
const message = await this.client.messages.create({
  model: aiParams?.model || AI_CONFIG.model,
  max_tokens: 2048,
  temperature: aiParams?.temperature !== undefined ? aiParams.temperature : 0.5,
  messages: [{
    role: 'user',
    content: prompt,
  }],
});
```

**Replace with (extract params for logging):**
```typescript
// Extract model and temperature for logging
const modelToUse = aiParams?.model || AI_CONFIG.model;
const temperatureToUse = aiParams?.temperature !== undefined ? aiParams.temperature : 0.5;

// Call Claude API (with optional parameter overrides)
const message = await this.client.messages.create({
  model: modelToUse,
  max_tokens: 2048,
  temperature: temperatureToUse,
  messages: [{
    role: 'user',
    content: prompt,
  }],
});
```

---

**Find this section:**

```typescript
// Parse JSON response
let dimensions: Partial<ChunkDimensions> = {};
try {
  const parsed = JSON.parse(responseText);
  
  // Map response to dimension fields based on template type
  dimensions = this.mapResponseToDimensions(parsed, template.template_type);
  
} catch (error) {
  console.error(`Failed to parse response for template ${template.template_name}:`, error);
  console.error(`Response was: ${responseText.substring(0, 200)}`);
}
```

**Replace with (add error tracking):**
```typescript
// Parse JSON response
let dimensions: Partial<ChunkDimensions> = {};
let parseError: string | null = null;

try {
  const parsed = JSON.parse(responseText);
  
  // Map response to dimension fields based on template type
  dimensions = this.mapResponseToDimensions(parsed, template.template_type);
  
} catch (error) {
  parseError = error instanceof Error ? error.message : String(error);
  console.error(`Failed to parse response for template ${template.template_name}:`, error);
  console.error(`Response was: ${responseText.substring(0, 200)}`);
}
```

---

**Find the end of the method (before the return statement):**

```typescript
// Calculate cost (approximate)
const inputTokens = Math.ceil(prompt.length / 4);  // Rough estimate
const outputTokens = Math.ceil(responseText.length / 4);
const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);  // Claude pricing

return { dimensions, cost };
```

**Change to (add logging call):**
```typescript
// Calculate cost (approximate)
const inputTokens = Math.ceil(prompt.length / 4);  // Rough estimate
const outputTokens = Math.ceil(responseText.length / 4);
const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);  // Claude pricing

// Log API response (non-blocking, will not throw errors)
await this.logClaudeResponse({
  chunkId: chunk.id,
  runId: runId,
  template,
  prompt,
  chunkTextPreview: chunk.chunk_text,
  documentCategory,
  aiParams: {
    model: modelToUse,
    temperature: temperatureToUse,
  },
  claudeMessage: message,
  parsedDimensions: dimensions,
  parseError,
  cost,
  inputTokens,
  outputTokens,
});

return { dimensions, cost };
```

---

#### Change 5: Update Call to executePromptTemplate

**Location:** In the `generateDimensionsForChunk` method (around line 190)

**Find this code:**
```typescript
const result = await this.executePromptTemplate({
  template,
  chunk,
  documentCategory,
  aiParams,
});
```

**Change to (add runId):**
```typescript
const result = await this.executePromptTemplate({
  template,
  chunk,
  documentCategory,
  runId, // ADD THIS - it's already available in the function scope
  aiParams,
});
```

---

## Testing Instructions

After implementing all changes:

### Test 1: Verify Code Compiles
```bash
npm run build
```
**Expected:** No TypeScript errors

### Test 2: Run Dimension Generation
Generate dimensions for at least one chunk.

### Test 3: Check Database Logs
In Supabase SQL Editor, run:
```sql
SELECT 
  id,
  chunk_id,
  template_type,
  model,
  parsed_successfully,
  input_tokens,
  output_tokens,
  estimated_cost_usd,
  created_at
FROM api_response_logs
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:** See rows with all your API responses (6 per chunk)

### Test 4: Check Console Output
Look for console messages:
```
✅ Logged API response: content_analysis
✅ Logged API response: task_extraction
✅ Logged API response: cer_analysis
✅ Logged API response: scenario_extraction
✅ Logged API response: training_pair_generation
✅ Logged API response: risk_assessment
```

---

## Success Criteria

- ✅ Code compiles without TypeScript errors
- ✅ Database logs are created in `api_response_logs` table
- ✅ Console shows logging confirmation messages
- ✅ Dimension generation still works correctly
- ✅ Logging failures don't break the app (wrapped in try-catch)
- ✅ 6 logs created per chunk (one for each template type)

---

## Troubleshooting

**Issue:** "Cannot find module 'api-response-log-service'"  
**Solution:** 
1. Verify you created `src/lib/database/api-response-log-service.ts`
2. Verify you exported it from `src/lib/database/index.ts`

**Issue:** "Table api_response_logs does not exist"  
**Solution:** Run the SQL table creation script in Supabase (STEP 1)

**Issue:** "Column does not exist"  
**Solution:** Verify table schema matches exactly. Drop and recreate if needed:
```sql
DROP TABLE api_response_logs;
-- Then run the CREATE TABLE script again
```

**Issue:** Logs not appearing in database  
**Solution:** 
1. Check Supabase console for errors
2. Verify table permissions (RLS policies if enabled)
3. Check console for error messages starting with ⚠️

**Issue:** TypeScript error on `aiParams` parameter  
**Solution:** Make sure you added `runId: string` to the method signature

---

## Rollback Plan

If logging causes issues:

### Option 1: Disable Logging (Immediate)
In `generator.ts`, change:
```typescript
const ENABLE_API_LOGGING = false;
```
Redeploy. Logging is completely bypassed.

### Option 2: Remove All Code
1. Remove `logClaudeResponse` method from generator.ts
2. Remove logging call in `executePromptTemplate`
3. Remove import for `apiResponseLogService`
4. Remove configuration constant
5. Remove `runId` parameter from `executePromptTemplate`
6. Remove `api-response-log-service.ts` file

Total time: 5 minutes


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

## Viewing Your Logs

After implementation, you can query your logs anytime:

### View Recent Logs


========================================================================================

SELECT 
  timestamp,
  chunk_id,
  template_type,
  model,
  parsed_successfully,
  input_tokens,
  output_tokens,
  estimated_cost_usd
FROM api_response_logs
ORDER BY timestamp DESC
LIMIT 20;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### View Logs for Specific Chunk


========================================================================================

SELECT 
  template_type,
  parsed_successfully,
  extraction_error,
  input_tokens,
  output_tokens
FROM api_response_logs
WHERE chunk_id = 'YOUR-CHUNK-ID-HERE'
ORDER BY timestamp ASC;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### View Total Cost by Template Type


========================================================================================

SELECT 
  template_type,
  COUNT(*) as total_calls,
  SUM(input_tokens) as total_input_tokens,
  SUM(output_tokens) as total_output_tokens,
  SUM(estimated_cost_usd) as total_cost_usd
FROM api_response_logs
GROUP BY template_type
ORDER BY total_cost_usd DESC;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



### Find Failed Parsing


========================================================================================

SELECT 
  chunk_id,
  template_type,
  extraction_error,
  timestamp
FROM api_response_logs
WHERE parsed_successfully = false
ORDER BY timestamp DESC;


++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++



---

## Summary

**What This Adds:**
- Complete audit trail of all Claude API interactions
- Persistent storage in Supabase (works on Vercel)
- Queryable logs for debugging and analysis
- Cost tracking per API call
- Error tracking for failed parses

**Risk Level:** 🟢 LOW
- Non-breaking (wrapped in try-catch)
- Can be disabled with single flag
- Database-only (no file system dependencies)
- Vercel-compatible (serverless-safe)

**Time Investment:** ~45 minutes
- 5 min: Create database table
- 35 min: Implement code changes
- 5 min: Test and verify

**Benefits:**
- ✅ Debug dimension generation issues
- ✅ Audit AI model behavior
- ✅ Track costs and token usage
- ✅ Identify parsing failures
- ✅ Production-ready logging

---

**End of Specification**

