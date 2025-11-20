# Conversation JSON Enrichment Pipeline - Execution Prompts E02
**Generated**: 2025-11-19  
**Segment**: E02 - Normalization, API & Pipeline Integration (Prompts 3 & 4)  
**Total Prompts in this file**: 2  
**Specification Source**: `06-cat-to-conv-file-filling_v2.md`

---

## Executive Summary

This file contains Prompts 3 & 4 of the 5-prompt implementation sequence. These prompts implement the final stages of the enrichment pipeline and integrate everything into a cohesive workflow.

**Pipeline Progress:**
1. ✅ DONE (E01-Prompt 1): Database schema + Validation service
2. ✅ DONE (E01-Prompt 2): Enrichment service
3. **Prompt 3**: Normalization service + API endpoints for downloads
4. **Prompt 4**: Complete pipeline integration + automatic processing
5. Future (E03-Prompt 5): UI components

**Key Deliverables:**
- JSON normalization service (validate encoding, format, schema)
- API endpoints for raw/enriched downloads and validation reports
- Complete enrichment pipeline orchestration
- Integration with existing conversation generation flow

---

## IMPORTANT: Use SAOL for All Database Operations

**For all Supabase operations use the Supabase Agent Ops Library (SAOL).**  
**Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

---

## Prompt 3: Normalization Service + API Endpoints

**Scope**: JSON normalization, API endpoints for raw/enriched downloads, validation reports  
**Dependencies**: Prompts 1-2 complete (validation + enrichment services exist)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Low (straightforward API and file serving)

========================

You are a senior full-stack TypeScript developer implementing the Normalization Service and API endpoints for the Conversation JSON Enrichment Pipeline. This prompt completes the data transformation layer and exposes download/report functionality via REST API.

**CRITICAL CONTEXT:**

**Pipeline State:**
1. ✅ Raw minimal JSON stored → `raw/{userId}/{convId}.json`
2. ✅ Validation service validates structure
3. ✅ Enrichment service populates predetermined fields → `{userId}/{convId}/enriched.json`
4. ➡️ **YOU ARE HERE**: Normalize enriched JSON and provide download APIs
5. ⏭️ Next (Prompt 4): Complete pipeline integration

**What You're Building:**
1. ConversationNormalizationService - validates byte encoding, JSON formatting, schema compliance
2. API endpoint: GET `/api/conversations/[id]/download/raw` - download raw minimal JSON
3. API endpoint: GET `/api/conversations/[id]/download/enriched` - download enriched JSON
4. API endpoint: GET `/api/conversations/[id]/validation-report` - get validation report

**File Locations:**
- Normalization Service: `src/lib/services/conversation-normalization-service.ts` (NEW)
- API Routes: `src/app/api/conversations/[id]/download/raw/route.ts` (NEW)
- API Routes: `src/app/api/conversations/[id]/download/enriched/route.ts` (NEW)
- API Routes: `src/app/api/conversations/[id]/validation-report/route.ts` (NEW)

---

### TASK 3.1: Implement Normalization Service

**Create file:** `src/lib/services/conversation-normalization-service.ts`

```typescript
/**
 * Conversation Normalization Service
 * 
 * Ensures enriched JSON is byte-valid, properly formatted, and schema-compliant.
 * Handles:
 * - UTF-8 encoding validation
 * - JSON formatting (proper indentation)
 * - Control character removal
 * - Size validation
 * - Basic schema compliance checks
 */

/**
 * Normalization result
 */
export interface NormalizationResult {
  success: boolean;
  normalizedJson: string;     // Normalized JSON string (empty if failed)
  issues: NormalizationIssue[];
  fileSize: number;           // Size in bytes
  error?: string;             // Error message if failed
}

/**
 * Individual normalization issue
 */
export interface NormalizationIssue {
  type: 'encoding' | 'formatting' | 'schema' | 'size';
  severity: 'info' | 'warning' | 'error';
  message: string;
  fixed: boolean;             // Was the issue auto-fixed?
}

export class ConversationNormalizationService {
  /**
   * Normalize enriched JSON
   * 
   * @param enrichedJson - Enriched JSON string
   * @returns Normalization result with normalized JSON or errors
   */
  async normalizeJson(enrichedJson: string): Promise<NormalizationResult> {
    const issues: NormalizationIssue[] = [];
    let normalizedJson = enrichedJson;

    try {
      // STEP 1: Parse to validate JSON syntax
      let parsed: any;
      try {
        parsed = JSON.parse(normalizedJson);
      } catch (error) {
        return {
          success: false,
          normalizedJson: '',
          issues: [{
            type: 'formatting',
            severity: 'error',
            message: `Invalid JSON syntax: ${error instanceof Error ? error.message : 'Unknown'}`,
            fixed: false
          }],
          fileSize: 0,
          error: `Invalid JSON syntax: ${error instanceof Error ? error.message : 'Unknown'}`
        };
      }

      // STEP 2: Re-serialize with proper formatting (2-space indentation)
      normalizedJson = JSON.stringify(parsed, null, 2);

      // STEP 3: Validate encoding (UTF-8, no control characters)
      const hasInvalidChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(normalizedJson);
      if (hasInvalidChars) {
        issues.push({
          type: 'encoding',
          severity: 'warning',
          message: 'Detected control characters in JSON - removing',
          fixed: true
        });
        // Remove control characters
        normalizedJson = normalizedJson.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      }

      // STEP 4: Validate size
      const fileSize = new Blob([normalizedJson], { type: 'application/json' }).size;

      if (fileSize < 1000) {
        issues.push({
          type: 'size',
          severity: 'warning',
          message: `File size suspiciously small: ${fileSize} bytes`,
          fixed: false
        });
      }

      if (fileSize > 100 * 1024 * 1024) { // 100MB
        issues.push({
          type: 'size',
          severity: 'error',
          message: `File size too large: ${fileSize} bytes (max 100MB)`,
          fixed: false
        });
        return {
          success: false,
          normalizedJson: '',
          issues,
          fileSize,
          error: 'File size exceeds 100MB limit'
        };
      }

      // STEP 5: Basic schema validation
      const schemaIssues = this.validateBasicSchema(parsed);
      issues.push(...schemaIssues);

      const hasErrors = issues.some(i => i.severity === 'error');

      return {
        success: !hasErrors,
        normalizedJson,
        issues,
        fileSize,
        ...(hasErrors && { error: 'Normalization found errors' })
      };

    } catch (error) {
      return {
        success: false,
        normalizedJson: '',
        issues: [{
          type: 'formatting',
          severity: 'error',
          message: `Normalization failed: ${error instanceof Error ? error.message : 'Unknown'}`,
          fixed: false
        }],
        fileSize: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate basic schema structure (enriched JSON)
   */
  private validateBasicSchema(parsed: any): NormalizationIssue[] {
    const issues: NormalizationIssue[] = [];

    // Check top-level keys for enriched format
    if (!parsed.dataset_metadata) {
      issues.push({
        type: 'schema',
        severity: 'error',
        message: 'Missing dataset_metadata (required for enriched format)',
        fixed: false
      });
    }

    if (!parsed.consultant_profile) {
      issues.push({
        type: 'schema',
        severity: 'warning',
        message: 'Missing consultant_profile',
        fixed: false
      });
    }

    if (!parsed.training_pairs || !Array.isArray(parsed.training_pairs)) {
      issues.push({
        type: 'schema',
        severity: 'error',
        message: 'Missing or invalid training_pairs array',
        fixed: false
      });
    } else if (parsed.training_pairs.length === 0) {
      issues.push({
        type: 'schema',
        severity: 'warning',
        message: 'training_pairs array is empty',
        fixed: false
      });
    }

    return issues;
  }
}

// Export factory function
export function createNormalizationService(): ConversationNormalizationService {
  return new ConversationNormalizationService();
}

// Export singleton
let normalizationServiceInstance: ConversationNormalizationService | null = null;

export function getNormalizationService(): ConversationNormalizationService {
  if (!normalizationServiceInstance) {
    normalizationServiceInstance = new ConversationNormalizationService();
  }
  return normalizationServiceInstance;
}
```

---

### TASK 3.2: API Endpoint - Download Raw JSON

**Create file:** `src/app/api/conversations/[id]/download/raw/route.ts`

```typescript
/**
 * API Route: Download raw minimal JSON
 * GET /api/conversations/[id]/download/raw
 * 
 * Returns signed URL to download raw minimal JSON from Claude (stored at raw_response_path)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getConversationStorageService } from '@/lib/services/conversation-storage-service';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Create Supabase client
    const supabase = createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get conversation storage service
    const storageService = getConversationStorageService();

    // Get raw response download URL
    try {
      const downloadInfo = await storageService.getRawResponseDownloadUrl(conversationId);

      return NextResponse.json({
        conversation_id: downloadInfo.conversation_id,
        download_url: downloadInfo.download_url,
        filename: downloadInfo.filename || `${conversationId}-raw.json`,
        file_size: downloadInfo.file_size,
        expires_at: downloadInfo.expires_at,
        expires_in_seconds: downloadInfo.expires_in_seconds
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return NextResponse.json(
            { error: 'Conversation not found or no raw response available' },
            { status: 404 }
          );
        }
        if (error.message.includes('No raw response path')) {
          return NextResponse.json(
            { error: 'No raw response available for this conversation' },
            { status: 404 }
          );
        }
      }

      console.error('Error generating raw download URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### TASK 3.3: API Endpoint - Download Enriched JSON

**Create file:** `src/app/api/conversations/[id]/download/enriched/route.ts`

```typescript
/**
 * API Route: Download enriched JSON
 * GET /api/conversations/[id]/download/enriched
 * 
 * Returns signed URL to download enriched JSON (with predetermined fields populated)
 * Only available when enrichment_status is 'enriched' or 'completed'
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Create Supabase client
    const supabase = createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch conversation to check enrichment status
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('conversation_id, enrichment_status, enriched_file_path, enriched_file_size')
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Check enrichment status
    if (conversation.enrichment_status !== 'completed' && conversation.enrichment_status !== 'enriched') {
      return NextResponse.json(
        { 
          error: `Enrichment not complete (status: ${conversation.enrichment_status})`,
          enrichment_status: conversation.enrichment_status
        },
        { status: 400 }
      );
    }

    // Check if enriched file path exists
    if (!conversation.enriched_file_path) {
      return NextResponse.json(
        { error: 'Enriched file path not found' },
        { status: 404 }
      );
    }

    // Generate signed URL
    const { data: signedData, error: signError } = await supabase.storage
      .from('conversation-files')
      .createSignedUrl(conversation.enriched_file_path, 3600); // 1 hour

    if (signError || !signedData) {
      console.error('Failed to generate signed URL:', signError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    // Extract filename
    const filename = conversation.enriched_file_path.split('/').pop() || `${conversationId}-enriched.json`;
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

    return NextResponse.json({
      conversation_id: conversationId,
      download_url: signedData.signedUrl,
      filename,
      file_size: conversation.enriched_file_size,
      enrichment_status: conversation.enrichment_status,
      expires_at: expiresAt,
      expires_in_seconds: 3600
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### TASK 3.4: API Endpoint - Validation Report

**Create file:** `src/app/api/conversations/[id]/validation-report/route.ts`

```typescript
/**
 * API Route: Get validation report
 * GET /api/conversations/[id]/validation-report
 * 
 * Returns validation report showing pipeline status, blockers, warnings, and timeline
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Create Supabase client
    const supabase = createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch conversation with validation data
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        conversation_id,
        enrichment_status,
        validation_report,
        enrichment_error,
        raw_stored_at,
        enriched_at,
        updated_at,
        processing_status
      `)
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Build pipeline stages status
    const pipelineStages = buildPipelineStages(conversation);

    // Build report
    const report = {
      conversation_id: conversationId,
      enrichment_status: conversation.enrichment_status,
      processing_status: conversation.processing_status,
      validation_report: conversation.validation_report || null,
      enrichment_error: conversation.enrichment_error || null,
      timeline: {
        raw_stored_at: conversation.raw_stored_at,
        enriched_at: conversation.enriched_at,
        last_updated: conversation.updated_at
      },
      pipeline_stages: pipelineStages
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Build pipeline stages status from conversation data
 */
function buildPipelineStages(conversation: any) {
  const status = conversation.enrichment_status;

  return {
    stage_1_generation: {
      name: 'Claude Generation',
      status: conversation.raw_stored_at ? 'completed' : 'pending',
      completed_at: conversation.raw_stored_at
    },
    stage_2_validation: {
      name: 'Structural Validation',
      status: status === 'validation_failed' ? 'failed' :
              ['validated', 'enrichment_in_progress', 'enriched', 'completed'].includes(status) ? 'completed' :
              'pending',
      completed_at: conversation.validation_report?.validatedAt || null
    },
    stage_3_enrichment: {
      name: 'Data Enrichment',
      status: status === 'enrichment_in_progress' ? 'in_progress' :
              ['enriched', 'completed'].includes(status) ? 'completed' :
              'pending',
      completed_at: conversation.enriched_at
    },
    stage_4_normalization: {
      name: 'JSON Normalization',
      status: status === 'normalization_failed' ? 'failed' :
              status === 'completed' ? 'completed' :
              'pending',
      completed_at: status === 'completed' ? conversation.updated_at : null
    }
  };
}
```

---

### ACCEPTANCE CRITERIA

✅ **Normalization Service:**
- ConversationNormalizationService class exported
- normalizeJson() validates encoding, formatting, schema
- Returns NormalizationResult with issues array
- Auto-fixes control characters
- Validates file size (warn <1KB, error >100MB)
- Re-serializes JSON with 2-space indentation

✅ **API Endpoints:**
- `/api/conversations/[id]/download/raw` returns signed URL for raw JSON
- `/api/conversations/[id]/download/enriched` returns signed URL for enriched JSON (only when enrichment_status = enriched/completed)
- `/api/conversations/[id]/validation-report` returns complete pipeline status
- All endpoints require authentication (401 if not logged in)
- All endpoints return 404 for non-existent conversations
- Signed URLs expire after 1 hour

✅ **Error Handling:**
- Authentication errors return 401
- Not found errors return 404
- Enrichment not complete returns 400 with current status
- Server errors return 500 with safe error message

---

### MANUAL TESTING

**Test 1: Normalization Service**

Create `test-normalization.ts`:

```typescript
import { getNormalizationService } from './src/lib/services/conversation-normalization-service';

async function testNormalization() {
  const service = getNormalizationService();
  
  // Valid enriched JSON
  const validJson = JSON.stringify({
    dataset_metadata: {
      dataset_name: "test_dataset",
      version: "1.0.0",
      created_date: "2025-11-19",
      vertical: "financial_planning",
      consultant_persona: "Elena Morales",
      target_use: "LoRA fine-tuning",
      conversation_source: "synthetic",
      quality_tier: "production",
      total_conversations: 1,
      total_turns: 4,
      notes: "Test"
    },
    consultant_profile: {
      name: "Elena Morales",
      business: "Pathways Financial Planning",
      expertise: "financial planning",
      years_experience: 15,
      core_philosophy: {},
      communication_style: { tone: "warm", techniques: [], avoid: [] }
    },
    training_pairs: [
      { id: "test1", conversation_id: "test", turn_number: 1 }
    ]
  });
  
  console.log('Testing normalization...');
  const result = await service.normalizeJson(validJson);
  
  console.log('Success:', result.success);
  console.log('File size:', result.fileSize, 'bytes');
  console.log('Issues:', result.issues.length);
  result.issues.forEach(issue => {
    console.log(`  ${issue.severity}: ${issue.message} (fixed: ${issue.fixed})`);
  });
}

testNormalization().catch(console.error);
```

**Run:** `npx tsx test-normalization.ts`

**Test 2: API Endpoints**

Use Thunder Client or curl:

```bash
# Get raw JSON download URL
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/conversations/test-conv-001/download/raw

# Get enriched JSON download URL
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/conversations/test-conv-001/download/enriched

# Get validation report
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/conversations/test-conv-001/validation-report
```

**Expected responses:**

Raw download:
```json
{
  "conversation_id": "test-conv-001",
  "download_url": "https://...supabase.co/.../raw/...",
  "filename": "test-conv-001-raw.json",
  "file_size": 2345,
  "expires_at": "2025-11-19T17:00:00Z",
  "expires_in_seconds": 3600
}
```

Enriched download (before enrichment):
```json
{
  "error": "Enrichment not complete (status: not_started)",
  "enrichment_status": "not_started"
}
```

Validation report:
```json
{
  "conversation_id": "test-conv-001",
  "enrichment_status": "validated",
  "validation_report": {
    "isValid": true,
    "hasBlockers": false,
    "hasWarnings": true,
    "warnings": [...],
    "summary": "Validation passed with 1 warning(s)"
  },
  "pipeline_stages": {
    "stage_1_generation": { "status": "completed", ... },
    "stage_2_validation": { "status": "completed", ... },
    "stage_3_enrichment": { "status": "pending", ... },
    "stage_4_normalization": { "status": "pending", ... }
  }
}
```

---

### DELIVERABLES

Submit:
1. ✅ New file `src/lib/services/conversation-normalization-service.ts`
2. ✅ New file `src/app/api/conversations/[id]/download/raw/route.ts`
3. ✅ New file `src/app/api/conversations/[id]/download/enriched/route.ts`
4. ✅ New file `src/app/api/conversations/[id]/validation-report/route.ts`
5. ✅ Test outputs showing normalization works
6. ✅ API test results (Thunder Client or curl screenshots)

+++++++++++++++++


---

## Prompt 4: Complete Pipeline Integration & Orchestration

**Scope**: Orchestrate complete enrichment pipeline, integrate with conversation generation  
**Dependencies**: Prompts 1-3 complete (all services and APIs exist)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Medium (integration complexity, error handling critical)

========================

You are a senior full-stack TypeScript developer implementing the Complete Enrichment Pipeline Orchestration. This prompt integrates all previous components into a cohesive, automatic workflow that runs after conversation generation.

**CRITICAL CONTEXT:**

**Pipeline State - ALL SERVICES EXIST:**
1. ✅ ConversationValidationService - validates minimal JSON
2. ✅ ConversationEnrichmentService - enriches with database metadata
3. ✅ ConversationNormalizationService - normalizes encoding/format
4. ✅ ConversationStorageService - stores files and updates database
5. ✅ API endpoints - download raw/enriched, view reports

**What You're Building:**
1. EnrichmentPipelineOrchestrator - coordinates entire pipeline
2. Integration with existing conversation generation flow
3. Error handling and retry logic
4. Pipeline status tracking and reporting

**Integration Points:**
- Hook into existing conversation generation (after `storeRawResponse()`)
- Update `enrichment_status` at each pipeline stage
- Handle failures gracefully (store errors, don't block generation)

**File Locations:**
- Pipeline Orchestrator: `src/lib/services/enrichment-pipeline-orchestrator.ts` (NEW)
- Integration hook: Update existing generation service/API

---

### TASK 4.1: Implement Pipeline Orchestrator

**Create file:** `src/lib/services/enrichment-pipeline-orchestrator.ts`

```typescript
/**
 * Enrichment Pipeline Orchestrator
 * 
 * Coordinates the complete enrichment pipeline from raw minimal JSON to normalized enriched JSON:
 * 1. Fetch raw JSON from storage
 * 2. Validate structure (ConversationValidationService)
 * 3. If valid: Enrich with database metadata (ConversationEnrichmentService)
 * 4. Normalize encoding/format (ConversationNormalizationService)
 * 5. Store enriched JSON and update database
 * 6. Update enrichment_status throughout
 * 
 * Error Handling:
 * - Validation failures: Save report, set status to 'validation_failed', STOP
 * - Enrichment failures: Save error, set status to 'validated' (can retry), STOP
 * - Normalization failures: Save error, keep enriched file, set status to 'normalization_failed'
 * - Storage failures: Retry once, then fail with error message
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getValidationService } from './conversation-validation-service';
import { getEnrichmentService } from './conversation-enrichment-service';
import { getNormalizationService } from './conversation-normalization-service';
import { getConversationStorageService } from './conversation-storage-service';

export interface PipelineResult {
  success: boolean;
  conversationId: string;
  finalStatus: string;           // enrichment_status value
  stagesCompleted: string[];     // ['validation', 'enrichment', 'normalization']
  error?: string;
  validationReport?: any;
  enrichedPath?: string;
  enrichedSize?: number;
}

export class EnrichmentPipelineOrchestrator {
  private supabase: SupabaseClient;
  private validationService: ReturnType<typeof getValidationService>;
  private enrichmentService: ReturnType<typeof getEnrichmentService>;
  private normalizationService: ReturnType<typeof getNormalizationService>;
  private storageService: ReturnType<typeof getConversationStorageService>;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    this.validationService = getValidationService();
    this.enrichmentService = getEnrichmentService();
    this.normalizationService = getNormalizationService();
    this.storageService = getConversationStorageService();
  }

  /**
   * Run complete enrichment pipeline for a conversation
   * 
   * @param conversationId - Conversation ID
   * @param userId - User ID for file paths
   * @returns Pipeline result with final status and metadata
   */
  async runPipeline(conversationId: string, userId: string): Promise<PipelineResult> {
    console.log(`[Pipeline] Starting enrichment pipeline for ${conversationId}`);
    
    const stagesCompleted: string[] = [];

    try {
      // STAGE 1: Fetch raw JSON
      console.log(`[Pipeline] Stage 1: Fetching raw JSON`);
      const rawJson = await this.fetchRawJson(conversationId);
      if (!rawJson) {
        throw new Error('No raw response found for conversation');
      }

      // STAGE 2: Validate structure
      console.log(`[Pipeline] Stage 2: Validating structure`);
      const validationResult = await this.validationService.validateMinimalJson(rawJson, conversationId);
      
      // Store validation report
      await this.supabase
        .from('conversations')
        .update({
          validation_report: validationResult,
          enrichment_status: validationResult.isValid ? 'validated' : 'validation_failed',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      if (!validationResult.isValid) {
        console.log(`[Pipeline] ❌ Validation failed with ${validationResult.blockers.length} blockers`);
        return {
          success: false,
          conversationId,
          finalStatus: 'validation_failed',
          stagesCompleted: [],
          error: `Validation failed: ${validationResult.summary}`,
          validationReport: validationResult
        };
      }

      stagesCompleted.push('validation');
      console.log(`[Pipeline] ✅ Validation passed (${validationResult.warnings.length} warnings)`);

      // STAGE 3: Enrich with database metadata
      console.log(`[Pipeline] Stage 3: Enriching with database metadata`);
      
      // Update status to in_progress
      await this.supabase
        .from('conversations')
        .update({
          enrichment_status: 'enrichment_in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      const parsedMinimal = JSON.parse(rawJson);
      const enriched = await this.enrichmentService.enrichConversation(conversationId, parsedMinimal);
      
      stagesCompleted.push('enrichment');
      console.log(`[Pipeline] ✅ Enrichment complete (${enriched.training_pairs.length} training pairs)`);

      // STAGE 4: Normalize JSON
      console.log(`[Pipeline] Stage 4: Normalizing JSON`);
      const enrichedJson = JSON.stringify(enriched, null, 2);
      const normalizationResult = await this.normalizationService.normalizeJson(enrichedJson);

      if (!normalizationResult.success) {
        // Normalization failed - store error but keep enriched file
        await this.supabase
          .from('conversations')
          .update({
            enrichment_status: 'normalization_failed',
            enrichment_error: normalizationResult.error || 'Normalization failed',
            updated_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId);

        return {
          success: false,
          conversationId,
          finalStatus: 'normalization_failed',
          stagesCompleted,
          error: `Normalization failed: ${normalizationResult.error}`
        };
      }

      stagesCompleted.push('normalization');
      console.log(`[Pipeline] ✅ Normalization complete (${normalizationResult.fileSize} bytes)`);

      // STAGE 5: Store enriched JSON
      console.log(`[Pipeline] Stage 5: Storing enriched JSON`);
      const storeResult = await this.storageService.storeEnrichedConversation(
        conversationId,
        userId,
        enriched
      );

      if (!storeResult.success) {
        // Storage failed - set error
        await this.supabase
          .from('conversations')
          .update({
            enrichment_error: storeResult.error || 'Storage failed',
            updated_at: new Date().toISOString()
          })
          .eq('conversation_id', conversationId);

        return {
          success: false,
          conversationId,
          finalStatus: 'enriched', // Enrichment succeeded, storage failed
          stagesCompleted,
          error: `Storage failed: ${storeResult.error}`
        };
      }

      console.log(`[Pipeline] ✅ Storage complete: ${storeResult.enrichedPath}`);

      // FINAL: Mark pipeline as completed
      await this.supabase
        .from('conversations')
        .update({
          enrichment_status: 'completed',
          processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      console.log(`[Pipeline] ✅✅✅ Pipeline complete for ${conversationId}`);

      return {
        success: true,
        conversationId,
        finalStatus: 'completed',
        stagesCompleted,
        enrichedPath: storeResult.enrichedPath,
        enrichedSize: storeResult.enrichedSize
      };

    } catch (error) {
      console.error(`[Pipeline] ❌ Pipeline failed:`, error);

      // Update with error
      await this.supabase
        .from('conversations')
        .update({
          enrichment_error: error instanceof Error ? error.message : 'Unknown error',
          updated_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId);

      return {
        success: false,
        conversationId,
        finalStatus: 'not_started',
        stagesCompleted,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch raw JSON from storage
   */
  private async fetchRawJson(conversationId: string): Promise<string | null> {
    // Get raw_response_path from database
    const { data: conversation } = await this.supabase
      .from('conversations')
      .select('raw_response_path')
      .eq('conversation_id', conversationId)
      .single();

    if (!conversation?.raw_response_path) {
      return null;
    }

    // Download from storage
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .download(conversation.raw_response_path);

    if (error || !data) {
      throw new Error(`Failed to download raw response: ${error?.message}`);
    }

    return await data.text();
  }

  /**
   * Retry failed enrichment pipeline
   * 
   * @param conversationId - Conversation ID
   * @param userId - User ID
   * @returns Pipeline result
   */
  async retryPipeline(conversationId: string, userId: string): Promise<PipelineResult> {
    console.log(`[Pipeline] Retrying enrichment pipeline for ${conversationId}`);

    // Reset enrichment_status to allow retry
    await this.supabase
      .from('conversations')
      .update({
        enrichment_status: 'not_started',
        enrichment_error: null,
        updated_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId);

    return this.runPipeline(conversationId, userId);
  }
}

// Export factory function
export function createPipelineOrchestrator(supabase?: SupabaseClient): EnrichmentPipelineOrchestrator {
  return new EnrichmentPipelineOrchestrator(supabase);
}

// Export singleton
let orchestratorInstance: EnrichmentPipelineOrchestrator | null = null;

export function getPipelineOrchestrator(): EnrichmentPipelineOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new EnrichmentPipelineOrchestrator();
  }
  return orchestratorInstance;
}
```

---

### TASK 4.2: Integration with Conversation Generation

**Update existing conversation generation flow to trigger enrichment pipeline**

Find the existing conversation generation API or service (likely in `src/app/api/conversations/generate` or similar).

Add this code AFTER raw response is stored:

```typescript
// EXISTING CODE (after storeRawResponse):
const storeResult = await conversationStorageService.storeRawResponse({
  conversationId,
  rawResponse,
  userId,
  metadata: {
    templateId,
    personaId,
    emotionalArcId,
    trainingTopicId
  }
});

// NEW CODE - Trigger enrichment pipeline (non-blocking)
if (storeResult.success) {
  console.log(`[Generation] Raw response stored, triggering enrichment pipeline...`);
  
  // Import orchestrator
  import { getPipelineOrchestrator } from '@/lib/services/enrichment-pipeline-orchestrator';
  
  // Run pipeline asynchronously (don't block response)
  getPipelineOrchestrator()
    .runPipeline(conversationId, userId)
    .then(result => {
      if (result.success) {
        console.log(`[Generation] ✅ Enrichment pipeline completed for ${conversationId}`);
      } else {
        console.error(`[Generation] ❌ Enrichment pipeline failed for ${conversationId}:`, result.error);
      }
    })
    .catch(error => {
      console.error(`[Generation] ❌ Enrichment pipeline threw error for ${conversationId}:`, error);
    });
}
```

**CRITICAL: Make pipeline execution non-blocking**
- Use `.then()` and `.catch()` instead of `await`
- DO NOT block the API response waiting for enrichment
- Generation should complete immediately after storing raw response
- Enrichment runs in background

---

### TASK 4.3: Create Manual Trigger API (Optional)

**Create file:** `src/app/api/conversations/[id]/enrich/route.ts`

```typescript
/**
 * API Route: Manually trigger enrichment pipeline
 * POST /api/conversations/[id]/enrich
 * 
 * Useful for:
 * - Retrying failed enrichments
 * - Triggering enrichment for old conversations
 * - Testing enrichment pipeline
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPipelineOrchestrator } from '@/lib/services/enrichment-pipeline-orchestrator';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;

    // Authenticate
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversation to verify it exists and get user_id
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('conversation_id, created_by, enrichment_status')
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Run pipeline
    console.log(`[API] Manually triggering enrichment for ${conversationId}`);
    const orchestrator = getPipelineOrchestrator();
    const result = await orchestrator.runPipeline(conversationId, conversation.created_by || user.id);

    if (result.success) {
      return NextResponse.json({
        success: true,
        conversation_id: result.conversationId,
        final_status: result.finalStatus,
        stages_completed: result.stagesCompleted,
        enriched_path: result.enrichedPath,
        enriched_size: result.enrichedSize
      });
    } else {
      return NextResponse.json({
        success: false,
        conversation_id: result.conversationId,
        final_status: result.finalStatus,
        stages_completed: result.stagesCompleted,
        error: result.error,
        validation_report: result.validationReport
      }, { status: 400 });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### ACCEPTANCE CRITERIA

✅ **Pipeline Orchestrator:**
- EnrichmentPipelineOrchestrator class exported
- runPipeline() coordinates all services in correct order
- Updates enrichment_status at each stage
- Handles errors gracefully (stores errors, doesn't throw)
- Returns PipelineResult with detailed status
- retryPipeline() method resets status and re-runs

✅ **Integration:**
- Pipeline triggered automatically after raw response stored
- Pipeline runs asynchronously (doesn't block API response)
- Generation API returns immediately
- Pipeline errors logged but don't fail generation

✅ **Status Tracking:**
- enrichment_status updated: not_started → validated → enrichment_in_progress → enriched → completed
- validation_report stored in database
- enrichment_error stored on failures
- enriched_file_path and enriched_at stored on success

✅ **Error Handling:**
- Validation failures: Stop at validation, save report
- Enrichment failures: Stop at enrichment, save error
- Normalization failures: Mark normalization_failed, keep enriched file
- Storage failures: Retry once, then fail with error

---

### MANUAL TESTING

**Test 1: Complete Pipeline**

Create `test-pipeline.ts`:

```typescript
import { getPipelineOrchestrator } from './src/lib/services/enrichment-pipeline-orchestrator';

async function testPipeline() {
  const orchestrator = getPipelineOrchestrator();
  
  // Run pipeline for existing conversation with raw response
  console.log('Testing complete enrichment pipeline...\n');
  
  const result = await orchestrator.runPipeline('test-conv-001', 'test-user-001');
  
  console.log('\nPipeline Result:');
  console.log('Success:', result.success);
  console.log('Final Status:', result.finalStatus);
  console.log('Stages Completed:', result.stagesCompleted);
  
  if (result.success) {
    console.log('Enriched Path:', result.enrichedPath);
    console.log('Enriched Size:', result.enrichedSize, 'bytes');
  } else {
    console.log('Error:', result.error);
    if (result.validationReport) {
      console.log('Validation Report:', result.validationReport.summary);
    }
  }
}

testPipeline().catch(console.error);
```

**Run:** `npx tsx test-pipeline.ts`

**Expected output (success):**
```
Testing complete enrichment pipeline...

[Pipeline] Starting enrichment pipeline for test-conv-001
[Pipeline] Stage 1: Fetching raw JSON
[Pipeline] Stage 2: Validating structure
[Pipeline] ✅ Validation passed (1 warnings)
[Pipeline] Stage 3: Enriching with database metadata
[Enrichment] Starting enrichment for conversation test-conv-001
[Enrichment] Fetching database metadata for test-conv-001
[Enrichment] ✅ Database metadata fetched
[Enrichment] ✅ Enrichment complete: 4 training pairs created
[Pipeline] ✅ Enrichment complete (4 training pairs)
[Pipeline] Stage 4: Normalizing JSON
[Pipeline] ✅ Normalization complete (4523 bytes)
[Pipeline] Stage 5: Storing enriched JSON
[Storage] ✅ Enriched file stored at test-user-001/test-conv-001/enriched.json
[Pipeline] ✅ Storage complete: test-user-001/test-conv-001/enriched.json
[Pipeline] ✅✅✅ Pipeline complete for test-conv-001

Pipeline Result:
Success: true
Final Status: completed
Stages Completed: ['validation', 'enrichment', 'normalization']
Enriched Path: test-user-001/test-conv-001/enriched.json
Enriched Size: 4523 bytes
```

**Test 2: Integration with Generation**

After updating generation flow, generate a new conversation and verify:
1. Raw response stored immediately
2. Enrichment pipeline starts automatically
3. Check database: `enrichment_status` progresses through stages
4. Check storage: enriched.json file appears
5. Verify pipeline completes even if API response already returned

**Test 3: Manual Trigger API**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/conversations/test-conv-001/enrich
```

**Expected response:**
```json
{
  "success": true,
  "conversation_id": "test-conv-001",
  "final_status": "completed",
  "stages_completed": ["validation", "enrichment", "normalization"],
  "enriched_path": "test-user-001/test-conv-001/enriched.json",
  "enriched_size": 4523
}
```

---

### DELIVERABLES

Submit:
1. ✅ New file `src/lib/services/enrichment-pipeline-orchestrator.ts`
2. ✅ Updated conversation generation service/API with pipeline trigger
3. ✅ New file `src/app/api/conversations/[id]/enrich/route.ts` (manual trigger)
4. ✅ Test script output showing complete pipeline execution
5. ✅ Database screenshot showing enrichment_status progression
6. ✅ Storage screenshot showing enriched.json file

**Completion checklist:**
- [ ] Pipeline orchestrator runs all stages in order
- [ ] enrichment_status updated at each stage
- [ ] Pipeline triggered automatically after generation
- [ ] Pipeline runs asynchronously (non-blocking)
- [ ] Manual trigger API works
- [ ] Error handling stores errors in database
- [ ] Validation failures don't proceed to enrichment
- [ ] Complete pipeline creates enriched.json file

+++++++++++++++++

---

**End of E02 Execution Prompts**

