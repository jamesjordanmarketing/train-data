# Claude API Response Logging - Implementation Specification v2
**Version:** 2.0  
**Date:** October 8, 2025  
**Purpose:** Add simple, non-invasive logging of all Claude API responses  
**Estimated Time:** 45-60 minutes  
**Risk Level:** 🟢 LOW (non-breaking change)

---

## 🚨 CRITICAL: Vercel Deployment Reality Check

### The Problem with File System Logging on Vercel

**Your Question:** "The app on Vercel will save JSON files to `system/chunks-alpha-data/ai_logs/` on the Vercel webserver, then I can `git pull` to get those files, right?"

**Answer:** ❌ **No, this won't work with Vercel's architecture.**

### Why Not?

Vercel uses **ephemeral file systems**:

1. **Read-Only Deployment**: Your code is deployed as read-only
2. **Serverless Functions**: Each API request runs in a temporary container
3. **No Persistence**: Files written at runtime disappear when the function ends
4. **No Git Integration**: Files written on Vercel never get committed to git

**What Actually Happens:**
```
1. Request comes in → Vercel creates temporary container
2. Your code runs → Writes JSON to system/chunks-alpha-data/ai_logs/
3. Response sent → Container destroyed
4. Files are GONE forever ❌
```

### The Solution: Database Logging

Instead of file system logging, we'll log to **Supabase** (your existing database).

**Benefits:**
- ✅ Works on Vercel (and everywhere else)
- ✅ Persistent storage (never lost)
- ✅ Queryable (filter, search, analyze)
- ✅ Can export to JSON files anytime you want
- ✅ No file system dependencies

---

## Revised Implementation Strategy

### Option 1: Database Logging (Recommended for Production)
**Use Case:** Vercel deployment, production environment  
**Storage:** Supabase `api_response_logs` table  
**Access:** Query via Supabase, export to JSON when needed

### Option 2: File System Logging (Development Only)
**Use Case:** Local development, debugging  
**Storage:** `system/chunks-alpha-data/ai_logs/` directory  
**Access:** Direct file access on your local machine

### Hybrid Approach (Recommended)
We'll implement **BOTH** options with environment-based switching:
- **Production (Vercel)**: Logs to database
- **Development (Local)**: Logs to files

---

## What Will Be Implemented

### 1. Database Schema

**New Table:** `api_response_logs`

```sql
CREATE TABLE api_response_logs (
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
  
  -- Indexes for common queries
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_api_response_logs_chunk_id ON api_response_logs(chunk_id);
CREATE INDEX idx_api_response_logs_run_id ON api_response_logs(run_id);
CREATE INDEX idx_api_response_logs_template_type ON api_response_logs(template_type);
CREATE INDEX idx_api_response_logs_created_at ON api_response_logs(created_at);
CREATE INDEX idx_api_response_logs_timestamp ON api_response_logs(timestamp);
```

---

### 2. File Structure (Development Only)

When running locally with file logging enabled:

```
system/
  chunks-alpha-data/
    ai_logs/
      2025-10-08T14-32-45-123Z_chunk-abc123_content_analysis.json
      2025-10-08T14-32-46-456Z_chunk-abc123_task_extraction.json
      ...
```

---

### 3. Log Data Structure

**Database Version (JSONB):**
```json
{
  "id": "uuid",
  "timestamp": "2025-10-08T14:32:45.123Z",
  "chunk_id": "975284d7-924b-41c0-8c8a-9cc92d2f1502",
  "template_type": "content_analysis",
  "model": "claude-3-7-sonnet-20250219",
  "claude_response": { /* full Claude API response */ },
  "dimensions_extracted": { /* parsed dimensions */ },
  "cost": 0.012345
}
```

**File Version (JSON):**
```json
{
  "metadata": { /* ... */ },
  "request": { /* ... */ },
  "response": { /* ... */ },
  "processing": { /* ... */ },
  "cost": { /* ... */ }
}
```

---

## Implementation Guide

### STEP 1: Create Database Table

**Action:** Run this SQL in Supabase SQL Editor:

```sql
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
```

**Expected Result:** Table created with 17 columns and 5 indexes

---

### STEP 2: Create Database Service (TypeScript)

**File:** `src/lib/database/api-response-log-service.ts` (NEW FILE)

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
  },

  /**
   * Export logs to JSON format (for local file creation)
   */
  async exportLogsToJson(chunkId: string): Promise<any[]> {
    const logs = await this.getLogsByChunk(chunkId);
    
    return logs.map(log => ({
      metadata: {
        timestamp: log.timestamp,
        chunk_id: log.chunk_id,
        template_type: log.template_type,
        template_name: log.template_name,
        model: log.model,
        temperature: log.temperature,
        max_tokens: log.max_tokens,
      },
      request: {
        prompt: log.prompt,
        chunk_text_preview: log.chunk_text_preview,
        document_category: log.document_category,
      },
      response: log.claude_response,
      processing: {
        parsed_successfully: log.parsed_successfully,
        extraction_error: log.extraction_error,
        dimensions_extracted: log.dimensions_extracted,
      },
      cost: {
        input_tokens: log.input_tokens,
        output_tokens: log.output_tokens,
        estimated_cost_usd: log.estimated_cost_usd,
      },
    }));
  }
};
```

---

### STEP 3: Update Database Index Export

**File:** `src/lib/database/index.ts`

Add this line to the exports:

```typescript
export { apiResponseLogService } from './api-response-log-service';
```

---

### STEP 4: Implement Hybrid Logging in Generator

This is the main implementation in `generator.ts`.

See the **Implementation Prompt** section below for the complete, copy-paste ready prompt.

---

## Testing Strategy

### Test 1: Database Logging (Production Mode)
```typescript
// In Supabase SQL editor, after generating dimensions:
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

**Expected Result:** Rows with all API responses

---

### Test 2: File Logging (Development Mode)
```bash
# Run locally with file logging enabled
# Check for files
ls -la system/chunks-alpha-data/ai_logs/

# Open a file
cat system/chunks-alpha-data/ai_logs/*.json | jq .
```

**Expected Result:** JSON files created locally

---

### Test 3: Export to JSON
```typescript
// Create API endpoint or script
const logs = await apiResponseLogService.exportLogsToJson('chunk-uuid');
console.log(JSON.stringify(logs, null, 2));
```

**Expected Result:** Database logs formatted as JSON

---

## Rollback Plan

### Option 1: Disable Logging
```typescript
// In generator.ts
const ENABLE_API_LOGGING = false;
```

### Option 2: Remove Table
```sql
DROP TABLE api_response_logs;
```

---

## Benefits of Database Approach

### vs File System Logging

| Feature | Database | File System |
|---------|----------|-------------|
| Works on Vercel | ✅ Yes | ❌ No (ephemeral) |
| Persistent storage | ✅ Yes | ⚠️ Local only |
| Queryable | ✅ SQL queries | ❌ Manual parsing |
| Searchable | ✅ Indexed | ❌ Slow |
| Team access | ✅ Shared database | ❌ Local files |
| Git required | ❌ No | ⚠️ Yes (for sharing) |
| Repository size | ✅ No impact | ⚠️ Grows with logs |
| Export capability | ✅ Anytime | ✅ Already files |

---

## Git Repository Integration

**Updated Strategy:**

Since logs are now in the database:
- ✅ No repository size growth
- ✅ No `.gitignore` needed for logs
- ✅ Export logs to JSON files when needed for analysis
- ✅ Share logs via database access (no file commits)

**Optional:** Add export script to generate JSON files on demand:

```typescript
// scripts/export-logs.ts
import { apiResponseLogService } from './src/lib/database';
import fs from 'fs/promises';
import path from 'path';

async function exportLogs(chunkId: string) {
  const logs = await apiResponseLogService.exportLogsToJson(chunkId);
  const dir = path.join(process.cwd(), 'system', 'chunks-alpha-data', 'ai_logs');
  await fs.mkdir(dir, { recursive: true });
  
  for (const log of logs) {
    const filename = `${log.metadata.timestamp}_${log.metadata.chunk_id.substring(0, 8)}_${log.metadata.template_type}.json`;
    await fs.writeFile(
      path.join(dir, filename),
      JSON.stringify(log, null, 2)
    );
  }
}
```

---

## Implementation Prompt for Cursor

**Copy everything between the === and +++ lines below into a NEW Cursor conversation with Claude-4.5-sonnet Thinking:**

========================================================================================

# TASK: Add Claude API Response Logging (Hybrid Database + File System)

## Context
You are working on the Bright Run LoRA Training Data Platform. We need to add logging of all Claude API responses for debugging and quality analysis.

**IMPORTANT:** The app deploys to Vercel (serverless), so we need database logging for production and optional file logging for local development.

## Your Task
Implement hybrid logging that:
1. **Production (Vercel)**: Logs to Supabase `api_response_logs` table
2. **Development (Local)**: Can optionally log to files
3. **Never breaks**: All logging wrapped in try-catch

## Prerequisites
Before starting, ensure:
- [ ] Database table `api_response_logs` exists (run SQL in spec)
- [ ] File `src/lib/database/api-response-log-service.ts` created (code in spec)
- [ ] Service exported from `src/lib/database/index.ts`

## Implementation Steps

### Step 1: Add Imports to generator.ts

**File:** `src/lib/dimension-generation/generator.ts`  
**Location:** Top of file, after existing imports

Add these imports:

```typescript
import { promises as fs } from 'fs';
import path from 'path';
import { apiResponseLogService } from '../database';
```

---

### Step 2: Add Configuration Constants

**File:** `src/lib/dimension-generation/generator.ts`  
**Location:** After imports, before the class definition

Add:

```typescript
// Configuration for API response logging
const ENABLE_API_LOGGING = true; // Master switch
const LOG_TO_DATABASE = true; // Supabase (production-ready, works on Vercel)
const LOG_TO_FILES = process.env.NODE_ENV === 'development'; // Local dev only
const API_LOGS_DIR = path.join(process.cwd(), 'system', 'chunks-alpha-data', 'ai_logs');
```

**Explanation:**
- `ENABLE_API_LOGGING`: Master on/off switch
- `LOG_TO_DATABASE`: Always true for production (Vercel-compatible)
- `LOG_TO_FILES`: Only true in development (files don't persist on Vercel)
- `API_LOGS_DIR`: Where files go in local dev

---

### Step 3: Add Logging Method

**File:** `src/lib/dimension-generation/generator.ts`  
**Location:** Inside `DimensionGenerator` class, after the constructor

Add this private method:

```typescript
/**
 * Log Claude API response for debugging and auditing
 * Supports both database (production) and file system (development) logging
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
    // Log to database (production-ready, works on Vercel)
    if (LOG_TO_DATABASE) {
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
      
      console.log(`✅ Logged API response to database: ${logData.template.template_type}`);
    }

    // Log to files (development only, won't work on Vercel)
    if (LOG_TO_FILES) {
      await fs.mkdir(API_LOGS_DIR, { recursive: true });

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const shortChunkId = logData.chunkId.substring(0, 8);
      const filename = `${timestamp}_${shortChunkId}_${logData.template.template_type}.json`;
      const filepath = path.join(API_LOGS_DIR, filename);

      const logObject = {
        metadata: {
          timestamp: new Date().toISOString(),
          chunk_id: logData.chunkId,
          run_id: logData.runId,
          template_type: logData.template.template_type,
          template_name: logData.template.template_name,
          model: logData.aiParams.model,
          temperature: logData.aiParams.temperature,
          max_tokens: 2048,
        },
        request: {
          prompt: logData.prompt,
          chunk_text_preview: logData.chunkTextPreview.substring(0, 200),
          document_category: logData.documentCategory,
        },
        response: logData.claudeMessage,
        processing: {
          parsed_successfully: logData.parseError === null,
          extraction_error: logData.parseError,
          dimensions_extracted: logData.parsedDimensions,
        },
        cost: {
          input_tokens: logData.inputTokens,
          output_tokens: logData.outputTokens,
          estimated_cost_usd: logData.cost,
        },
      };

      await fs.writeFile(filepath, JSON.stringify(logObject, null, 2), 'utf-8');
      console.log(`✅ Logged API response to file: ${filename}`);
    }
  } catch (error) {
    // Log error but don't throw - logging failures should not break dimension generation
    console.error('⚠️ Failed to log Claude API response:', error);
  }
}
```

---

### Step 4: Modify executePromptTemplate Method

**File:** `src/lib/dimension-generation/generator.ts`  
**Method:** `executePromptTemplate`  
**Location:** Around lines 224-295

Find this section in the method and make the following changes:

**BEFORE (current code):**
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
  const { template, chunk, documentCategory, aiParams } = params;

  // Build prompt by replacing placeholders
  const prompt = template.prompt_text
    .replace('{chunk_type}', chunk.chunk_type)
    .replace('{doc_title}', 'Document')
    .replace('{primary_category}', documentCategory)
    .replace('{chunk_text}', chunk.chunk_text);

  // Call Claude API
  const message = await this.client.messages.create({
    model: aiParams?.model || AI_CONFIG.model,
    max_tokens: 2048,
    temperature: aiParams?.temperature !== undefined ? aiParams.temperature : 0.5,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // Extract response
  let responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
  
  // Strip markdown code blocks
  responseText = responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/,'').trim();
  
  // Parse JSON response
  let dimensions: Partial<ChunkDimensions> = {};
  try {
    const parsed = JSON.parse(responseText);
    dimensions = this.mapResponseToDimensions(parsed, template.template_type);
  } catch (error) {
    console.error(`Failed to parse response for template ${template.template_name}:`, error);
    console.error(`Response was: ${responseText.substring(0, 200)}`);
  }

  // Calculate cost
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(responseText.length / 4);
  const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);

  return { dimensions, cost };
}
```

**AFTER (modified code with logging):**
```typescript
private async executePromptTemplate(params: {
  template: PromptTemplate;
  chunk: Chunk;
  documentCategory: string;
  runId: string; // ADD THIS PARAMETER
  aiParams?: {
    temperature?: number;
    model?: string;
  };
}): Promise<{ dimensions: Partial<ChunkDimensions>; cost: number }> {
  const { template, chunk, documentCategory, runId, aiParams } = params; // ADD runId

  // Build prompt by replacing placeholders
  const prompt = template.prompt_text
    .replace('{chunk_type}', chunk.chunk_type)
    .replace('{doc_title}', 'Document')
    .replace('{primary_category}', documentCategory)
    .replace('{chunk_text}', chunk.chunk_text);

  // Extract model and temperature for logging
  const modelToUse = aiParams?.model || AI_CONFIG.model;
  const temperatureToUse = aiParams?.temperature !== undefined ? aiParams.temperature : 0.5;

  // Call Claude API
  const message = await this.client.messages.create({
    model: modelToUse,
    max_tokens: 2048,
    temperature: temperatureToUse,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  });

  // Extract response
  let responseText = message.content[0].type === 'text' ? message.content[0].text : '{}';
  
  // Strip markdown code blocks
  responseText = responseText.replace(/^```json\s*\n?/i, '').replace(/\n?```\s*$/,'').trim();
  
  // Parse JSON response
  let dimensions: Partial<ChunkDimensions> = {};
  let parseError: string | null = null; // ADD THIS

  try {
    const parsed = JSON.parse(responseText);
    dimensions = this.mapResponseToDimensions(parsed, template.template_type);
  } catch (error) {
    parseError = error instanceof Error ? error.message : String(error); // CAPTURE ERROR
    console.error(`Failed to parse response for template ${template.template_name}:`, error);
    console.error(`Response was: ${responseText.substring(0, 200)}`);
  }

  // Calculate cost
  const inputTokens = Math.ceil(prompt.length / 4);
  const outputTokens = Math.ceil(responseText.length / 4);
  const cost = (inputTokens * 0.000003) + (outputTokens * 0.000015);

  // Log API response (non-blocking, will not throw errors)
  await this.logClaudeResponse({
    chunkId: chunk.id,
    runId: runId, // Pass runId
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
}
```

**Key Changes:**
1. Added `runId: string` parameter to method signature
2. Extract `modelToUse` and `temperatureToUse` to variables
3. Added `parseError` tracking
4. Added `logClaudeResponse` call before return
5. Pass `runId` to logging function

---

### Step 5: Update Call to executePromptTemplate

**File:** `src/lib/dimension-generation/generator.ts`  
**Method:** `generateDimensionsForChunk`  
**Location:** Around line 190

Find this line:
```typescript
const result = await this.executePromptTemplate({
  template,
  chunk,
  documentCategory,
  aiParams,
});
```

Change it to:
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

## Testing

### Test 1: Database Logging
1. Run dimension generation for one chunk
2. In Supabase SQL editor, run:
```sql
SELECT * FROM api_response_logs ORDER BY created_at DESC LIMIT 5;
```
3. Verify 6 rows (one per template type)

### Test 2: File Logging (Local Dev)
1. Set `NODE_ENV=development`
2. Run dimension generation
3. Check: `ls system/chunks-alpha-data/ai_logs/`
4. Verify JSON files exist

### Test 3: Both Disabled
1. Set `ENABLE_API_LOGGING = false`
2. Run dimension generation
3. Verify no logs created
4. Verify dimension generation still works

## Success Criteria
- ✅ Code compiles without TypeScript errors
- ✅ Database logs are created on Vercel
- ✅ File logs are created in local development
- ✅ Dimension generation still works correctly
- ✅ Logging failures don't break the app
- ✅ Console shows logging confirmation messages

## Troubleshooting

**Issue:** "Cannot find module 'api-response-log-service'"  
**Solution:** Make sure you created the service file and exported it from `src/lib/database/index.ts`

**Issue:** "Table api_response_logs does not exist"  
**Solution:** Run the SQL table creation script in Supabase

**Issue:** Files not being created locally  
**Solution:** Check that `NODE_ENV=development` is set

**Issue:** Logs not appearing in Supabase  
**Solution:** Check Supabase console for errors, verify table permissions

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

---

## Summary

**Difficulty:** 🟡 MEDIUM (45-60 minutes, includes database setup)

**Changes Required:**
- 1 new database table: `api_response_logs`
- 1 new service file: `api-response-log-service.ts`
- 1 file modified: `generator.ts`
- Add 3 imports
- Add 4 configuration constants
- Add 1 logging method (~80 lines)
- Modify 1 method (`executePromptTemplate`, ~20 lines changed)
- Update 1 method call (add `runId` parameter)

**Risk Level:** 🟢 LOW
- Non-breaking change
- Wrapped in error handling
- Can be disabled with single flag
- Database-first approach (Vercel-compatible)

**Production Benefits:**
- ✅ Works on Vercel (database storage)
- ✅ Persistent across deployments
- ✅ Queryable and searchable
- ✅ No file system dependencies
- ✅ Team-accessible

**Development Benefits:**
- ✅ Optional local file logging
- ✅ Direct JSON file access
- ✅ Easy debugging

**Recommended:** ✅ Safe to implement immediately

---

**End of Specification v2**

