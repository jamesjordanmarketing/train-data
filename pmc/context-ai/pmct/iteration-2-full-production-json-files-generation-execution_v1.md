# LoRA Training JSON Files Generation - Execution Plan v1.0

**Generated**: 2025-12-01  
**Segment**: Full Production JSON Files Generation  
**Total Prompts**: 2  
**Estimated Implementation Time**: 24-32 hours  
**Functional Requirements**: New LoRA Training JSON Files Page with batch conversation aggregation

---

## Executive Summary

This specification implements the new **LoRA Training JSON Files** page that allows users to aggregate individual enriched conversation JSON files into full production training JSON and JSONL files following the v4.0 schema specification.

**Key Deliverables:**
- Batch ID tracking for conversations (via batch_items join table)
- New `training_files` database table for managing full JSON/JSONL files
- Full JSON aggregation service that correctly merges conversations
- JSONL generation from full JSON files
- New LoRA Training JSON Files page UI
- "Create Training Files" button on conversations page with dropdown selector
- Bulk fault-tolerant processing (up to 80 conversations at once)
- Download options for both JSON and JSONL formats

**Architecture Decisions (Based on Analysis):**
1. **Batch ID Location**: Use existing `batch_items` join table (batch_job_id + conversation_id relationship) - NO new batch_id column needed on conversations table
2. **Training Files Storage**: New bucket `training-files` in Supabase Storage with paths `training-files/<file_id>/{training.json,training.jsonl}`
3. **Training Files Table**: New `training_files` table to track metadata and file locations
4. **JSONL Timing**: Generate JSONL automatically every time conversations are added to full JSON (always stay in sync)
5. **Service Architecture**: New `TrainingFileService` dedicated to training file management (separate from ExportService)

---

## Context and Dependencies

### Current Codebase State

**Existing Infrastructure:**
- ✅ Conversations table with enrichment pipeline (`enrichment_status`, `enriched_file_path`)
- ✅ Batch_items table linking conversations to batch jobs (many-to-many via `batch_job_id` + `conversation_id`)
- ✅ Batch_jobs table tracking bulk generation operations
- ✅ Export system with transformers (JSONL, JSON, CSV, Markdown)
- ✅ Supabase Storage with `conversation-files` bucket for individual files
- ✅ ConversationTable component with checkbox selection
- ✅ SAOL library for safe database operations

**Key Files:**
- Database types: `src/lib/types/conversations.ts`
- Export service: `src/lib/export-service.ts`
- Transformers: `src/lib/export-transformers/`
- Conversation table: `src/components/conversations/ConversationTable.tsx`
- Conversation service: `src/lib/services/conversation-service.ts`

### Schema References

**Individual Conversation JSON Schema:**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-individual-JSON-format_v4.json`

**Full Training File JSON Schema (TARGET FORMAT):**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-full-JSON-format_v4.json`

**Schema Specification:**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v1.md`

---

## Implementation Prompts

### Prompt 1: Database, Service Layer & Aggregation Logic

**Scope**: Create training_files table, TrainingFileService, Full JSON aggregation logic  
**Dependencies**: SAOL library, Supabase Storage, existing conversation schema  
**Estimated Time**: 14-16 hours  
**Risk Level**: Medium (complex JSON aggregation and validation)

========================

You are a senior full-stack Next.js 14 developer implementing the database and service layer for the LoRA Training JSON Files system.

**CONTEXT:**

The system needs to aggregate individual enriched conversation JSON files (stored per-conversation in Supabase Storage) into full production training JSON files that contain multiple conversations, following the v4.0 schema specification.

**SCHEMA SPECIFICATIONS:**

**Individual JSON Schema Location:**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-individual-JSON-format_v4.json`

**Full JSON Schema Location (TARGET):**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-full-JSON-format_v4.json`

**Schema Documentation:**
`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\iteration-2-full-production-json-file-schema-spec_v1.md`

Read these files to understand the exact structure you must implement.

**CURRENT DATABASE STATE:**

From SAOL investigation, the conversations table has these relevant fields:
- `id`, `conversation_id`: Identifiers
- `enrichment_status`: Tracks enrichment progress ('completed' required)
- `enriched_file_path`: Path to enriched JSON in Supabase Storage
- `persona_id`, `emotional_arc_id`, `training_topic_id`: Scaffolding references
- `persona_key`, `emotional_arc_key`, `topic_key`: Machine-readable keys
- `quality_score`, `empathy_score`, `clarity_score`, `appropriateness_score`, `brand_voice_alignment`: Quality metrics
- `created_at`, `tier`, `status`: Metadata
- NO `batch_id` column (uses batch_items join table instead)

The batch_items table has:
- `batch_job_id`: Links to batch_jobs table
- `conversation_id`: Links to conversations table
- This is how we track which batch generated which conversations

**ARCHITECTURAL DECISIONS:**

1. **Batch ID Source**: Query via batch_items join table (no new column needed)
2. **Training Files Storage**: New bucket `training-files` with structure:
   ```
   training-files/
     <training_file_id>/
       training.json
       training.jsonl
   ```
3. **Service**: New `TrainingFileService` class (separate from ExportService)
4. **JSONL Generation**: Always generate alongside JSON (synchronous, keep in sync)

**TASKS:**

**Task 1.1: Create training_files Database Table**

Use SAOL library to execute this migration:

```typescript
// File: src/scripts/migrations/create-training-files-table.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const migrationSQL = `
-- Migration: Create training_files table
-- Purpose: Track aggregated LoRA training files (JSON + JSONL pairs)

CREATE TABLE IF NOT EXISTS training_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  
  -- File Storage Paths (NOT URLs - generate signed URLs on-demand)
  json_file_path TEXT NOT NULL,
  jsonl_file_path TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'training-files',
  
  -- Aggregation Metadata
  conversation_count INTEGER NOT NULL DEFAULT 0,
  total_training_pairs INTEGER NOT NULL DEFAULT 0,
  json_file_size BIGINT,
  jsonl_file_size BIGINT,
  
  -- Quality Summary (aggregated from included conversations)
  avg_quality_score NUMERIC(3,2),
  min_quality_score NUMERIC(3,2),
  max_quality_score NUMERIC(3,2),
  human_reviewed_count INTEGER DEFAULT 0,
  
  -- Scaffolding Distribution (JSON field tracking persona/arc/topic counts)
  scaffolding_distribution JSONB DEFAULT '{}',
  
  -- Status Tracking
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'processing', 'failed')),
  last_updated_at TIMESTAMPTZ,
  
  -- Audit Fields
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table: which conversations are in which training files
CREATE TABLE IF NOT EXISTS training_file_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_file_id UUID NOT NULL REFERENCES training_files(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Prevent duplicates (same conversation can't be in same file twice)
  CONSTRAINT unique_training_file_conversation UNIQUE(training_file_id, conversation_id)
);

-- Indexes for performance
CREATE INDEX idx_training_files_created_by ON training_files(created_by);
CREATE INDEX idx_training_files_status ON training_files(status);
CREATE INDEX idx_training_files_created_at ON training_files(created_at DESC);
CREATE INDEX idx_training_file_conversations_file_id ON training_file_conversations(training_file_id);
CREATE INDEX idx_training_file_conversations_conversation_id ON training_file_conversations(conversation_id);

-- RLS Policies
ALTER TABLE training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_file_conversations ENABLE ROW LEVEL SECURITY;

-- Users can view all training files (for dropdown selector)
CREATE POLICY "Users can view training files"
  ON training_files FOR SELECT
  USING (true);

-- Users can create training files
CREATE POLICY "Users can create training files"
  ON training_files FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own training files
CREATE POLICY "Users can update own training files"
  ON training_files FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can view all training file conversations
CREATE POLICY "Users can view training file conversations"
  ON training_file_conversations FOR SELECT
  USING (true);

-- Users can add conversations to training files they created
CREATE POLICY "Users can add conversations to own training files"
  ON training_file_conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_files 
      WHERE id = training_file_id 
      AND created_by = auth.uid()
    )
  );

COMMENT ON TABLE training_files IS 'Aggregated LoRA training files containing multiple conversations';
COMMENT ON TABLE training_file_conversations IS 'Junction table linking conversations to training files';
`;

async function runMigration() {
  const { error } = await supabase.rpc('exec', { sql: migrationSQL });
  if (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
  console.log('✅ Migration completed successfully');
}

runMigration();
```

**Validation**: After running, verify with:
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('training_files', 'training_file_conversations')
ORDER BY table_name, ordinal_position;
```

**Task 1.2: Create TrainingFileService**

File: `src/lib/services/training-file-service.ts`

```typescript
/**
 * TrainingFileService
 * 
 * Manages LoRA training files (aggregated JSON + JSONL pairs).
 * Handles:
 * - Creating new training files
 * - Adding conversations to existing files
 * - Aggregating individual JSONs into full JSON format
 * - Generating JSONL from full JSON
 * - Storing files in Supabase Storage
 * - Tracking metadata and scaffolding distribution
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export interface TrainingFile {
  id: string;
  name: string;
  description: string | null;
  json_file_path: string;
  jsonl_file_path: string;
  storage_bucket: string;
  conversation_count: number;
  total_training_pairs: number;
  json_file_size: number | null;
  jsonl_file_size: number | null;
  avg_quality_score: number | null;
  min_quality_score: number | null;
  max_quality_score: number | null;
  human_reviewed_count: number;
  scaffolding_distribution: ScaffoldingDistribution;
  status: 'active' | 'archived' | 'processing' | 'failed';
  last_updated_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScaffoldingDistribution {
  personas: Record<string, number>;      // persona_key -> count
  emotional_arcs: Record<string, number>; // emotional_arc_key -> count
  training_topics: Record<string, number>; // topic_key -> count
}

export interface TrainingFileConversation {
  id: string;
  training_file_id: string;
  conversation_id: string;
  added_at: string;
  added_by: string | null;
}

export interface CreateTrainingFileInput {
  name: string;
  description?: string;
  conversation_ids: string[];  // Initial conversations to add
  created_by: string;
}

export interface AddConversationsInput {
  training_file_id: string;
  conversation_ids: string[];
  added_by: string;
}

export interface FullTrainingJSON {
  training_file_metadata: {
    file_name: string;
    version: string;
    created_date: string;
    last_updated: string;
    format_spec: string;
    target_model?: string;
    vertical: string;
    total_conversations: number;
    total_training_pairs: number;
    quality_summary: {
      avg_quality_score: number;
      min_quality_score: number;
      max_quality_score: number;
      human_reviewed_count: number;
      human_reviewed_percentage: number;
    };
    scaffolding_distribution: ScaffoldingDistribution;
  };
  consultant_profile: {
    name: string;
    business: string;
    expertise: string;
    years_experience: number;
    core_philosophy: Record<string, string>;
    communication_style: {
      tone: string;
      techniques: string[];
      avoid: string[];
    };
  };
  conversations: any[]; // Array of conversation objects from individual JSONs
}

export class TrainingFileService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Create a new training file with initial conversations
   */
  async createTrainingFile(input: CreateTrainingFileInput): Promise<TrainingFile> {
    try {
      // 1. Validate conversations exist and are eligible
      const validationResult = await this.validateConversationsForTraining(input.conversation_ids);
      if (!validationResult.isValid) {
        throw new Error(`Conversation validation failed: ${validationResult.errors.join(', ')}`);
      }

      // 2. Fetch enriched JSON files for all conversations
      const conversations = await this.fetchEnrichedConversations(input.conversation_ids);
      
      // 3. Build full training JSON
      const fullJSON = await this.aggregateConversationsToFullJSON(
        conversations,
        input.name,
        input.description
      );
      
      // 4. Generate JSONL from full JSON
      const jsonlContent = this.convertFullJSONToJSONL(fullJSON);
      
      // 5. Upload both files to Supabase Storage
      const fileId = uuidv4();
      const jsonPath = `training-files/${fileId}/training.json`;
      const jsonlPath = `training-files/${fileId}/training.jsonl`;
      
      await this.uploadToStorage(jsonPath, JSON.stringify(fullJSON, null, 2));
      await this.uploadToStorage(jsonlPath, jsonlContent);
      
      // 6. Calculate metadata
      const metadata = this.calculateMetadata(fullJSON, conversations);
      
      // 7. Create database record
      const { data: trainingFile, error } = await this.supabase
        .from('training_files')
        .insert({
          name: input.name,
          description: input.description || null,
          json_file_path: jsonPath,
          jsonl_file_path: jsonlPath,
          storage_bucket: 'training-files',
          conversation_count: conversations.length,
          total_training_pairs: metadata.totalTrainingPairs,
          json_file_size: Buffer.byteLength(JSON.stringify(fullJSON)),
          jsonl_file_size: Buffer.byteLength(jsonlContent),
          avg_quality_score: metadata.avgQualityScore,
          min_quality_score: metadata.minQualityScore,
          max_quality_score: metadata.maxQualityScore,
          human_reviewed_count: metadata.humanReviewedCount,
          scaffolding_distribution: metadata.scaffoldingDistribution,
          status: 'active',
          last_updated_at: new Date().toISOString(),
          created_by: input.created_by,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // 8. Add conversation associations
      const associations = input.conversation_ids.map(conv_id => ({
        training_file_id: trainingFile.id,
        conversation_id: conv_id,
        added_by: input.created_by,
      }));
      
      const { error: assocError } = await this.supabase
        .from('training_file_conversations')
        .insert(associations);
      
      if (assocError) throw assocError;
      
      return trainingFile as TrainingFile;
      
    } catch (error) {
      console.error('Error creating training file:', error);
      throw error;
    }
  }

  /**
   * Add conversations to an existing training file
   */
  async addConversationsToTrainingFile(input: AddConversationsInput): Promise<TrainingFile> {
    try {
      // 1. Check for duplicates
      const { data: existing } = await this.supabase
        .from('training_file_conversations')
        .select('conversation_id')
        .eq('training_file_id', input.training_file_id)
        .in('conversation_id', input.conversation_ids);
      
      if (existing && existing.length > 0) {
        const duplicates = existing.map(e => e.conversation_id);
        throw new Error(`Conversations already in training file: ${duplicates.join(', ')}`);
      }
      
      // 2. Validate new conversations
      const validationResult = await this.validateConversationsForTraining(input.conversation_ids);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // 3. Get existing training file
      const { data: existingFile } = await this.supabase
        .from('training_files')
        .select('*')
        .eq('id', input.training_file_id)
        .single();
      
      if (!existingFile) throw new Error('Training file not found');
      
      // 4. Download existing JSON file
      const existingJSON = await this.downloadJSONFile(existingFile.json_file_path);
      
      // 5. Fetch new conversations
      const newConversations = await this.fetchEnrichedConversations(input.conversation_ids);
      
      // 6. Merge conversations into existing JSON
      const updatedJSON = this.mergeConversationsIntoFullJSON(existingJSON, newConversations);
      
      // 7. Regenerate JSONL
      const updatedJSONL = this.convertFullJSONToJSONL(updatedJSON);
      
      // 8. Upload updated files
      await this.uploadToStorage(existingFile.json_file_path, JSON.stringify(updatedJSON, null, 2));
      await this.uploadToStorage(existingFile.jsonl_file_path, updatedJSONL);
      
      // 9. Recalculate metadata
      const allConversationIds = [
        ...existing?.map(e => e.conversation_id) || [],
        ...input.conversation_ids
      ];
      const allConversations = await this.fetchEnrichedConversations(allConversationIds);
      const metadata = this.calculateMetadata(updatedJSON, allConversations);
      
      // 10. Update database record
      const { data: updated, error } = await this.supabase
        .from('training_files')
        .update({
          conversation_count: existingFile.conversation_count + input.conversation_ids.length,
          total_training_pairs: metadata.totalTrainingPairs,
          json_file_size: Buffer.byteLength(JSON.stringify(updatedJSON)),
          jsonl_file_size: Buffer.byteLength(updatedJSONL),
          avg_quality_score: metadata.avgQualityScore,
          min_quality_score: metadata.minQualityScore,
          max_quality_score: metadata.maxQualityScore,
          human_reviewed_count: metadata.humanReviewedCount,
          scaffolding_distribution: metadata.scaffoldingDistribution,
          last_updated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.training_file_id)
        .select()
        .single();
      
      if (error) throw error;
      
      // 11. Add new conversation associations
      const associations = input.conversation_ids.map(conv_id => ({
        training_file_id: input.training_file_id,
        conversation_id: conv_id,
        added_by: input.added_by,
      }));
      
      await this.supabase
        .from('training_file_conversations')
        .insert(associations);
      
      return updated as TrainingFile;
      
    } catch (error) {
      console.error('Error adding conversations to training file:', error);
      throw error;
    }
  }

  /**
   * List all training files
   */
  async listTrainingFiles(filters?: {
    status?: TrainingFile['status'];
    created_by?: string;
  }): Promise<TrainingFile[]> {
    let query = this.supabase
      .from('training_files')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.created_by) {
      query = query.eq('created_by', filters.created_by);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data as TrainingFile[];
  }

  /**
   * Get training file by ID
   */
  async getTrainingFile(id: string): Promise<TrainingFile | null> {
    const { data, error } = await this.supabase
      .from('training_files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data as TrainingFile;
  }

  /**
   * Get conversations in a training file
   */
  async getTrainingFileConversations(training_file_id: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('training_file_conversations')
      .select('conversation_id')
      .eq('training_file_id', training_file_id);
    
    if (error) throw error;
    
    return data.map(item => item.conversation_id);
  }

  /**
   * Generate signed download URL for JSON or JSONL file
   */
  async getDownloadUrl(
    file_path: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('training-files')
      .createSignedUrl(file_path, expiresIn);
    
    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Failed to generate signed URL');
    
    return data.signedUrl;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private async validateConversationsForTraining(
    conversation_ids: string[]
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    // Fetch conversations
    const { data: conversations, error } = await this.supabase
      .from('conversations')
      .select('conversation_id, enrichment_status, enriched_file_path')
      .in('conversation_id', conversation_ids);
    
    if (error) {
      errors.push(`Database error: ${error.message}`);
      return { isValid: false, errors };
    }
    
    if (!conversations || conversations.length === 0) {
      errors.push('No conversations found');
      return { isValid: false, errors };
    }
    
    // Check each conversation
    for (const conv of conversations) {
      if (conv.enrichment_status !== 'completed') {
        errors.push(`Conversation ${conv.conversation_id}: enrichment_status must be 'completed' (currently: ${conv.enrichment_status})`);
      }
      if (!conv.enriched_file_path) {
        errors.push(`Conversation ${conv.conversation_id}: enriched_file_path is null`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async fetchEnrichedConversations(conversation_ids: string[]): Promise<any[]> {
    // Fetch conversation metadata from database
    const { data: conversations, error } = await this.supabase
      .from('conversations')
      .select(`
        conversation_id,
        enriched_file_path,
        persona_key,
        emotional_arc_key,
        topic_key,
        quality_score,
        empathy_score,
        clarity_score,
        appropriateness_score,
        brand_voice_alignment,
        created_at,
        tier
      `)
      .in('conversation_id', conversation_ids);
    
    if (error) throw error;
    
    // Download enriched JSON files from storage
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const jsonContent = await this.downloadJSONFile(conv.enriched_file_path);
        return {
          metadata: conv,
          json: jsonContent,
        };
      })
    );
    
    return enrichedConversations;
  }

  private async downloadJSONFile(file_path: string): Promise<any> {
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .download(file_path);
    
    if (error) throw error;
    
    const text = await data.text();
    return JSON.parse(text);
  }

  private async uploadToStorage(file_path: string, content: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from('training-files')
      .upload(file_path, content, {
        contentType: file_path.endsWith('.json') ? 'application/json' : 'application/x-ndjson',
        upsert: true,
      });
    
    if (error) throw error;
  }

  private aggregateConversationsToFullJSON(
    conversations: any[],
    fileName: string,
    description?: string
  ): FullTrainingJSON {
    // Build full JSON following v4.0 schema
    const fullJSON: FullTrainingJSON = {
      training_file_metadata: {
        file_name: fileName,
        version: '4.0.0',
        created_date: new Date().toISOString().split('T')[0],
        last_updated: new Date().toISOString(),
        format_spec: 'brightrun-lora-v4',
        vertical: 'financial_planning_consultant',
        total_conversations: conversations.length,
        total_training_pairs: 0, // Calculated below
        quality_summary: {
          avg_quality_score: 0,
          min_quality_score: 0,
          max_quality_score: 0,
          human_reviewed_count: 0,
          human_reviewed_percentage: 0,
        },
        scaffolding_distribution: {
          personas: {},
          emotional_arcs: {},
          training_topics: {},
        },
      },
      consultant_profile: {
        name: 'Elena Morales, CFP',
        business: 'Pathways Financial Planning',
        expertise: 'fee-only financial planning for mid-career professionals',
        years_experience: 15,
        core_philosophy: {
          principle_1: 'Money is emotional - always acknowledge feelings before facts',
          principle_2: 'Create judgment-free space - normalize struggles explicitly',
          principle_3: 'Education-first - teach the why not just the what',
          principle_4: 'Progress over perfection - celebrate small wins',
          principle_5: 'Values-aligned decisions - personal context over generic rules',
        },
        communication_style: {
          tone: 'warm, professional, never condescending',
          techniques: [
            'acknowledge emotions explicitly',
            'use metaphors and stories for complex concepts',
            'provide specific numbers over abstractions',
            'ask permission before educating',
            'celebrate progress and small wins',
          ],
          avoid: [
            'financial jargon without explanation',
            'assumptions about knowledge level',
            'judgment of past financial decisions',
            'overwhelming with too many options',
            'generic platitudes without specifics',
          ],
        },
      },
      conversations: [],
    };
    
    let totalPairs = 0;
    let qualityScores: number[] = [];
    
    // Aggregate each conversation
    for (const conv of conversations) {
      const enrichedJSON = conv.json;
      const metadata = conv.metadata;
      
      // Extract training_pairs from enriched JSON
      const trainingPairs = enrichedJSON.training_pairs || [];
      totalPairs += trainingPairs.length;
      
      // Track scaffolding distribution
      if (metadata.persona_key) {
        fullJSON.training_file_metadata.scaffolding_distribution.personas[metadata.persona_key] = 
          (fullJSON.training_file_metadata.scaffolding_distribution.personas[metadata.persona_key] || 0) + 1;
      }
      if (metadata.emotional_arc_key) {
        fullJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[metadata.emotional_arc_key] = 
          (fullJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[metadata.emotional_arc_key] || 0) + 1;
      }
      if (metadata.topic_key) {
        fullJSON.training_file_metadata.scaffolding_distribution.training_topics[metadata.topic_key] = 
          (fullJSON.training_file_metadata.scaffolding_distribution.training_topics[metadata.topic_key] || 0) + 1;
      }
      
      // Track quality scores
      if (metadata.quality_score) {
        qualityScores.push(metadata.quality_score);
      }
      
      // Add conversation to conversations array
      fullJSON.conversations.push({
        conversation_metadata: {
          conversation_id: metadata.conversation_id,
          source_file: `fp_conversation_${metadata.conversation_id}.json`,
          created_date: metadata.created_at.split('T')[0],
          total_turns: trainingPairs.length,
          quality_tier: this.mapQualityTier(metadata.quality_score),
          scaffolding: {
            persona_key: metadata.persona_key,
            persona_name: enrichedJSON.training_pairs[0]?.conversation_metadata?.client_persona || '',
            emotional_arc_key: metadata.emotional_arc_key,
            emotional_arc: enrichedJSON.training_pairs[0]?.conversation_metadata?.emotional_arc || '',
            training_topic_key: metadata.topic_key,
            training_topic: enrichedJSON.training_pairs[0]?.conversation_metadata?.training_topic || '',
          },
        },
        training_pairs: trainingPairs,
      });
    }
    
    // Calculate summary statistics
    fullJSON.training_file_metadata.total_training_pairs = totalPairs;
    
    if (qualityScores.length > 0) {
      fullJSON.training_file_metadata.quality_summary.avg_quality_score = 
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      fullJSON.training_file_metadata.quality_summary.min_quality_score = Math.min(...qualityScores);
      fullJSON.training_file_metadata.quality_summary.max_quality_score = Math.max(...qualityScores);
    }
    
    return fullJSON;
  }

  private mergeConversationsIntoFullJSON(
    existingJSON: FullTrainingJSON,
    newConversations: any[]
  ): FullTrainingJSON {
    // Similar to aggregateConversationsToFullJSON but merges into existing
    const mergedJSON = { ...existingJSON };
    
    let totalPairs = existingJSON.training_file_metadata.total_training_pairs;
    let qualityScores: number[] = [];
    
    // Extract existing quality scores
    for (const conv of existingJSON.conversations) {
      if (conv.conversation_metadata.quality_tier) {
        // Reverse map tier to score (approximate)
        const score = this.reverseMapQualityTier(conv.conversation_metadata.quality_tier);
        if (score) qualityScores.push(score);
      }
    }
    
    // Add new conversations
    for (const conv of newConversations) {
      const enrichedJSON = conv.json;
      const metadata = conv.metadata;
      const trainingPairs = enrichedJSON.training_pairs || [];
      
      totalPairs += trainingPairs.length;
      
      // Update scaffolding distribution
      if (metadata.persona_key) {
        mergedJSON.training_file_metadata.scaffolding_distribution.personas[metadata.persona_key] = 
          (mergedJSON.training_file_metadata.scaffolding_distribution.personas[metadata.persona_key] || 0) + 1;
      }
      if (metadata.emotional_arc_key) {
        mergedJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[metadata.emotional_arc_key] = 
          (mergedJSON.training_file_metadata.scaffolding_distribution.emotional_arcs[metadata.emotional_arc_key] || 0) + 1;
      }
      if (metadata.topic_key) {
        mergedJSON.training_file_metadata.scaffolding_distribution.training_topics[metadata.topic_key] = 
          (mergedJSON.training_file_metadata.scaffolding_distribution.training_topics[metadata.topic_key] || 0) + 1;
      }
      
      if (metadata.quality_score) {
        qualityScores.push(metadata.quality_score);
      }
      
      mergedJSON.conversations.push({
        conversation_metadata: {
          conversation_id: metadata.conversation_id,
          source_file: `fp_conversation_${metadata.conversation_id}.json`,
          created_date: metadata.created_at.split('T')[0],
          total_turns: trainingPairs.length,
          quality_tier: this.mapQualityTier(metadata.quality_score),
          scaffolding: {
            persona_key: metadata.persona_key,
            persona_name: enrichedJSON.training_pairs[0]?.conversation_metadata?.client_persona || '',
            emotional_arc_key: metadata.emotional_arc_key,
            emotional_arc: enrichedJSON.training_pairs[0]?.conversation_metadata?.emotional_arc || '',
            training_topic_key: metadata.topic_key,
            training_topic: enrichedJSON.training_pairs[0]?.conversation_metadata?.training_topic || '',
          },
        },
        training_pairs: trainingPairs,
      });
    }
    
    // Update metadata
    mergedJSON.training_file_metadata.total_conversations = mergedJSON.conversations.length;
    mergedJSON.training_file_metadata.total_training_pairs = totalPairs;
    mergedJSON.training_file_metadata.last_updated = new Date().toISOString();
    
    if (qualityScores.length > 0) {
      mergedJSON.training_file_metadata.quality_summary.avg_quality_score = 
        qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length;
      mergedJSON.training_file_metadata.quality_summary.min_quality_score = Math.min(...qualityScores);
      mergedJSON.training_file_metadata.quality_summary.max_quality_score = Math.max(...qualityScores);
    }
    
    return mergedJSON;
  }

  private convertFullJSONToJSONL(fullJSON: FullTrainingJSON): string {
    const lines: string[] = [];
    
    // Optional metadata header
    lines.push(JSON.stringify({
      _meta: {
        file_name: fullJSON.training_file_metadata.file_name,
        total_pairs: fullJSON.training_file_metadata.total_training_pairs,
        version: fullJSON.training_file_metadata.version,
      },
    }));
    
    // Convert each training pair to JSONL line
    for (const conversation of fullJSON.conversations) {
      for (const pair of conversation.training_pairs) {
        // Skip pairs without target_response (turn 1 often has null target)
        if (pair.target_response === null) continue;
        
        const jsonlLine = {
          id: `${pair.id}_${conversation.conversation_metadata.conversation_id.substring(0, 8)}`,
          conversation_id: conversation.conversation_metadata.conversation_id,
          turn_number: pair.turn_number,
          conversation_metadata: pair.conversation_metadata,
          system_prompt: pair.system_prompt,
          conversation_history: pair.conversation_history,
          current_user_input: pair.current_user_input,
          emotional_context: pair.emotional_context,
          target_response: pair.target_response,
          training_metadata: pair.training_metadata,
        };
        
        lines.push(JSON.stringify(jsonlLine));
      }
    }
    
    return lines.join('\n');
  }

  private calculateMetadata(fullJSON: FullTrainingJSON, conversations: any[]): {
    totalTrainingPairs: number;
    avgQualityScore: number;
    minQualityScore: number;
    maxQualityScore: number;
    humanReviewedCount: number;
    scaffoldingDistribution: ScaffoldingDistribution;
  } {
    const qualityScores = conversations
      .map(c => c.metadata.quality_score)
      .filter(s => s !== null && s !== undefined);
    
    return {
      totalTrainingPairs: fullJSON.training_file_metadata.total_training_pairs,
      avgQualityScore: qualityScores.length > 0 
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
        : 0,
      minQualityScore: qualityScores.length > 0 ? Math.min(...qualityScores) : 0,
      maxQualityScore: qualityScores.length > 0 ? Math.max(...qualityScores) : 0,
      humanReviewedCount: 0, // TODO: Track human reviews
      scaffoldingDistribution: fullJSON.training_file_metadata.scaffolding_distribution,
    };
  }

  private mapQualityTier(quality_score: number | null): string {
    if (!quality_score) return 'experimental';
    if (quality_score >= 4.5) return 'seed_dataset';
    if (quality_score >= 3.5) return 'production';
    if (quality_score >= 2.5) return 'experimental';
    return 'rejected';
  }

  private reverseMapQualityTier(tier: string): number | null {
    switch (tier) {
      case 'seed_dataset': return 4.5;
      case 'production': return 3.5;
      case 'experimental': return 3.0;
      case 'rejected': return 2.0;
      default: return null;
    }
  }
}

// Export singleton creator
export const createTrainingFileService = (supabase: SupabaseClient) => {
  return new TrainingFileService(supabase);
};
```

**Task 1.3: Create API Endpoints**

File: `src/app/api/training-files/route.ts` (GET for list, POST for create)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';
import { z } from 'zod';

const CreateTrainingFileSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  conversation_ids: z.array(z.string().uuid()).min(1).max(80),
});

// GET /api/training-files - List all training files
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const service = createTrainingFileService(supabase);
    const files = await service.listTrainingFiles({ status: 'active' });
    
    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error listing training files:', error);
    return NextResponse.json(
      { error: 'Failed to list training files' },
      { status: 500 }
    );
  }
}

// POST /api/training-files - Create new training file
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = CreateTrainingFileSchema.parse(body);
    
    const service = createTrainingFileService(supabase);
    const trainingFile = await service.createTrainingFile({
      name: validated.name,
      description: validated.description,
      conversation_ids: validated.conversation_ids,
      created_by: user.id,
    });
    
    return NextResponse.json({ trainingFile }, { status: 201 });
  } catch (error) {
    console.error('Error creating training file:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create training file' },
      { status: 500 }
    );
  }
}
```

File: `src/app/api/training-files/[id]/add-conversations/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';
import { z } from 'zod';

const AddConversationsSchema = z.object({
  conversation_ids: z.array(z.string().uuid()).min(1).max(80),
});

// POST /api/training-files/:id/add-conversations
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const validated = AddConversationsSchema.parse(body);
    
    const service = createTrainingFileService(supabase);
    const updated = await service.addConversationsToTrainingFile({
      training_file_id: params.id,
      conversation_ids: validated.conversation_ids,
      added_by: user.id,
    });
    
    return NextResponse.json({ trainingFile: updated });
  } catch (error) {
    console.error('Error adding conversations:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to add conversations' },
      { status: 500 }
    );
  }
}
```

File: `src/app/api/training-files/[id]/download/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';
import { z } from 'zod';

const DownloadQuerySchema = z.object({
  format: z.enum(['json', 'jsonl']),
});

// GET /api/training-files/:id/download?format=json|jsonl
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const validated = DownloadQuerySchema.parse({
      format: searchParams.get('format') || 'json',
    });
    
    const service = createTrainingFileService(supabase);
    const trainingFile = await service.getTrainingFile(params.id);
    
    if (!trainingFile) {
      return NextResponse.json({ error: 'Training file not found' }, { status: 404 });
    }
    
    const filePath = validated.format === 'json' 
      ? trainingFile.json_file_path 
      : trainingFile.jsonl_file_path;
    
    const downloadUrl = await service.getDownloadUrl(filePath);
    
    return NextResponse.json({
      download_url: downloadUrl,
      filename: `${trainingFile.name}.${validated.format}`,
      expires_in_seconds: 3600,
    });
  } catch (error) {
    console.error('Error generating download URL:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
```

**ACCEPTANCE CRITERIA:**

1. **Database Schema**:
   - ✅ training_files table exists with all columns
   - ✅ training_file_conversations junction table exists
   - ✅ Unique constraint on (training_file_id, conversation_id)
   - ✅ RLS policies enable viewing all files but only creating/editing own files
   - ✅ Indexes on created_by, status, created_at, junction table FKs

2. **TrainingFileService**:
   - ✅ createTrainingFile() validates conversations, aggregates JSONs, uploads files
   - ✅ addConversationsToTrainingFile() checks duplicates, merges JSONs, regenerates JSONL
   - ✅ Validation blocks non-completed or missing enriched_file_path conversations
   - ✅ Full JSON structure matches v4.0 schema exactly (training_file_metadata, consultant_profile, conversations array)
   - ✅ JSONL generation: one line per training pair with target_response, includes metadata header
   - ✅ Scaffolding distribution correctly tracks persona/arc/topic counts
   - ✅ Quality summary calculates avg/min/max correctly

3. **API Endpoints**:
   - ✅ POST /api/training-files creates new file with initial conversations
   - ✅ GET /api/training-files lists all active training files
   - ✅ POST /api/training-files/:id/add-conversations adds to existing file
   - ✅ GET /api/training-files/:id/download?format=json|jsonl generates signed URL
   - ✅ All endpoints require authentication
   - ✅ Validation errors return 400 with details
   - ✅ Duplicate conversation error returns clear message

4. **Error Handling**:
   - ✅ Validation pre-check blocks submission if conversations don't meet criteria
   - ✅ Duplicate detection prevents adding same conversation twice to same file
   - ✅ Storage upload failures rollback database changes (TODO: implement transactions)
   - ✅ Clear error messages for user-facing errors

5. **Storage Structure**:
   - ✅ Files stored in training-files bucket
   - ✅ Path structure: training-files/<file_id>/{training.json,training.jsonl}
   - ✅ Both JSON and JSONL always present and in sync
   - ✅ Signed URLs expire after 1 hour

**TESTING STEPS:**

1. Run migration script, verify tables created
2. Create test conversations with enrichment_status='completed' and enriched_file_path set
3. Call POST /api/training-files with 3 conversation IDs, verify:
   - Returns training file record
   - JSON file uploaded to storage with correct structure
   - JSONL file uploaded with one line per training pair
   - Database record has correct conversation_count, scaffolding_distribution
4. Call POST /api/training-files/:id/add-conversations with 2 more conversations, verify:
   - Updated files in storage
   - conversation_count incremented
   - Scaffolding distribution updated
   - JSONL regenerated correctly
5. Call GET /api/training-files/:id/download?format=json, verify signed URL works
6. Call GET /api/training-files/:id/download?format=jsonl, verify signed URL works
7. Test duplicate prevention: try adding same conversation twice, verify error
8. Test validation: try adding conversation with enrichment_status='not_started', verify blocked

++++++++++++++++++



### Prompt 2: UI Components & Integration

**Scope**: LoRA Training JSON Files page, conversations table integration with "Create Training Files" button  
**Dependencies**: Prompt 1 (database, service layer, API endpoints working)  
**Estimated Time**: 10-12 hours  
**Risk Level**: Low (standard Next.js UI implementation)

========================

You are a senior full-stack Next.js 14 developer implementing the UI for the LoRA Training JSON Files system.

**CONTEXT:**

Users need:
1. A new page to view and manage training files
2. A "Create Training Files" button on the conversations page
3. A dropdown to select existing files or create new ones
4. Download options for JSON and JSONL formats

**CURRENT CODEBASE:**

ConversationTable component location:
`src/components/conversations/ConversationTable.tsx`

It already has:
- Checkbox selection with `selectedConversationIds` from Zustand store
- Action buttons area where we'll add the new button

**TASKS:**

**Task 2.1: Create LoRA Training JSON Files Page**

File: `src/app/(dashboard)/training-files/page.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface TrainingFile {
  id: string;
  name: string;
  description: string | null;
  conversation_count: number;
  total_training_pairs: number;
  json_file_size: number | null;
  jsonl_file_size: number | null;
  avg_quality_score: number | null;
  scaffolding_distribution: {
    personas: Record<string, number>;
    emotional_arcs: Record<string, number>;
    training_topics: Record<string, number>;
  };
  status: string;
  created_at: string;
}

export default function TrainingFilesPage() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<'json' | 'jsonl' | null>(null);

  // Fetch training files
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['training-files'],
    queryFn: async () => {
      const response = await fetch('/api/training-files');
      if (!response.ok) {
        throw new Error('Failed to fetch training files');
      }
      const json = await response.json();
      return json.files as TrainingFile[];
    },
  });

  const handleDownload = async (fileId: string, format: 'json' | 'jsonl', fileName: string) => {
    try {
      setDownloadingId(fileId);
      setDownloadFormat(format);

      const response = await fetch(`/api/training-files/${fileId}/download?format=${format}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate download URL');
      }

      const { download_url, filename } = await response.json();

      // Open download URL in new tab
      window.open(download_url, '_blank');

      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadingId(null);
      setDownloadFormat(null);
    }
  };

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatScaffoldingDistribution = (distribution: TrainingFile['scaffolding_distribution']) => {
    const totalPersonas = Object.values(distribution.personas).reduce((sum, count) => sum + count, 0);
    const totalArcs = Object.values(distribution.emotional_arcs).reduce((sum, count) => sum + count, 0);
    const totalTopics = Object.values(distribution.training_topics).reduce((sum, count) => sum + count, 0);

    return {
      personas: `${totalPersonas} personas`,
      arcs: `${totalArcs} arcs`,
      topics: `${totalTopics} topics`,
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">LoRA Training JSON Files</h1>
          <p className="text-muted-foreground mt-1">
            Manage aggregated training files for LoRA fine-tuning
          </p>
        </div>
        <Button onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading training files...</p>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error loading training files: {error.message}</p>
          </CardContent>
        </Card>
      )}

      {data && data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileJson className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No training files yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first training file from the Conversations page
            </p>
          </CardContent>
        </Card>
      )}

      {data && data.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Files ({data.length})</CardTitle>
            <CardDescription>
              Aggregated conversation datasets ready for LoRA training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Conversations</TableHead>
                  <TableHead>Training Pairs</TableHead>
                  <TableHead>Avg Quality</TableHead>
                  <TableHead>Distribution</TableHead>
                  <TableHead>Files</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((file) => {
                  const distribution = formatScaffoldingDistribution(file.scaffolding_distribution);
                  const isDownloading = downloadingId === file.id;

                  return (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{file.name}</div>
                          {file.description && (
                            <div className="text-sm text-muted-foreground">
                              {file.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{file.conversation_count}</TableCell>
                      <TableCell>{file.total_training_pairs}</TableCell>
                      <TableCell>
                        {file.avg_quality_score ? (
                          <Badge variant="outline">
                            {file.avg_quality_score.toFixed(2)}
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>{distribution.personas}</div>
                          <div>{distribution.arcs}</div>
                          <div>{distribution.topics}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <FileJson className="h-3 w-3" />
                            {formatFileSize(file.json_file_size)}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {formatFileSize(file.jsonl_file_size)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isDownloading && downloadFormat === 'json'}
                            onClick={() => handleDownload(file.id, 'json', file.name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            JSON
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isDownloading && downloadFormat === 'jsonl'}
                            onClick={() => handleDownload(file.id, 'jsonl', file.name)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            JSONL
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Task 2.2: Add "Create Training Files" Button to Conversations Page**

Update file: `src/components/conversations/ConversationTable.tsx`

Add this button near the existing bulk actions area (around line 150-200):

```typescript
// Import at top
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileJson, Plus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Add state in component (around line 80)
const [showCreateTrainingFileDialog, setShowCreateTrainingFileDialog] = useState(false);
const [newFileName, setNewFileName] = useState('');
const [newFileDescription, setNewFileDescription] = useState('');
const [selectedTrainingFileId, setSelectedTrainingFileId] = useState<string | null>(null);
const queryClient = useQueryClient();

// Fetch training files for dropdown
const { data: trainingFiles } = useQuery({
  queryKey: ['training-files'],
  queryFn: async () => {
    const response = await fetch('/api/training-files');
    if (!response.ok) throw new Error('Failed to fetch training files');
    const json = await response.json();
    return json.files;
  },
  enabled: selectedConversationIds.length > 0,
});

// Create new training file mutation
const createTrainingFileMutation = useMutation({
  mutationFn: async ({
    name,
    description,
    conversation_ids,
  }: {
    name: string;
    description?: string;
    conversation_ids: string[];
  }) => {
    const response = await fetch('/api/training-files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, conversation_ids }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create training file');
    }
    
    return response.json();
  },
  onSuccess: () => {
    toast.success('Training file created successfully');
    queryClient.invalidateQueries({ queryKey: ['training-files'] });
    clearSelection();
    setShowCreateTrainingFileDialog(false);
    setNewFileName('');
    setNewFileDescription('');
  },
  onError: (error: Error) => {
    toast.error(error.message);
  },
});

// Add to existing training file mutation
const addToTrainingFileMutation = useMutation({
  mutationFn: async ({
    training_file_id,
    conversation_ids,
  }: {
    training_file_id: string;
    conversation_ids: string[];
  }) => {
    const response = await fetch(`/api/training-files/${training_file_id}/add-conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_ids }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add conversations');
    }
    
    return response.json();
  },
  onSuccess: () => {
    toast.success('Conversations added to training file');
    queryClient.invalidateQueries({ queryKey: ['training-files'] });
    clearSelection();
    setSelectedTrainingFileId(null);
  },
  onError: (error: Error) => {
    toast.error(error.message);
  },
});

// Handler functions
const handleCreateNewFile = () => {
  if (!newFileName.trim()) {
    toast.error('Please enter a file name');
    return;
  }
  
  if (selectedConversationIds.length === 0) {
    toast.error('No conversations selected');
    return;
  }
  
  createTrainingFileMutation.mutate({
    name: newFileName.trim(),
    description: newFileDescription.trim() || undefined,
    conversation_ids: selectedConversationIds,
  });
};

const handleAddToExistingFile = (fileId: string) => {
  if (selectedConversationIds.length === 0) {
    toast.error('No conversations selected');
    return;
  }
  
  addToTrainingFileMutation.mutate({
    training_file_id: fileId,
    conversation_ids: selectedConversationIds,
  });
};

// Add button in the render (near other action buttons)
// Look for the area with bulk action buttons and add:

{selectedConversationIds.length > 0 && (
  <div className="flex items-center gap-2">
    <span className="text-sm text-muted-foreground">
      {selectedConversationIds.length} selected
    </span>
    
    {/* Existing bulk action buttons here */}
    
    {/* NEW: Create Training Files Button */}
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          <FileJson className="h-4 w-4 mr-2" />
          Create Training Files
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Add to Training File</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => setShowCreateTrainingFileDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Training File
        </DropdownMenuItem>
        
        {trainingFiles && trainingFiles.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Existing Files
            </DropdownMenuLabel>
            {trainingFiles.map((file: any) => (
              <DropdownMenuItem
                key={file.id}
                onClick={() => handleAddToExistingFile(file.id)}
                disabled={addToTrainingFileMutation.isPending}
              >
                <FileJson className="h-4 w-4 mr-2" />
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {file.conversation_count} conversations
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
)}

{/* Dialog for creating new training file */}
<Dialog open={showCreateTrainingFileDialog} onOpenChange={setShowCreateTrainingFileDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create New Training File</DialogTitle>
      <DialogDescription>
        Create a new LoRA training file with {selectedConversationIds.length} selected conversations
      </DialogDescription>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">File Name *</Label>
        <Input
          id="name"
          value={newFileName}
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder="e.g., Training Batch Alpha"
          maxLength={255}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={newFileDescription}
          onChange={(e) => setNewFileDescription(e.target.value)}
          placeholder="Describe this training file..."
          rows={3}
        />
      </div>
      
      <div className="bg-muted p-3 rounded-md text-sm">
        <div className="font-medium mb-1">Selected Conversations:</div>
        <div className="text-muted-foreground">
          {selectedConversationIds.length} conversations will be added to this training file
        </div>
      </div>
    </div>
    
    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setShowCreateTrainingFileDialog(false)}
        disabled={createTrainingFileMutation.isPending}
      >
        Cancel
      </Button>
      <Button
        onClick={handleCreateNewFile}
        disabled={createTrainingFileMutation.isPending || !newFileName.trim()}
      >
        {createTrainingFileMutation.isPending ? 'Creating...' : 'Create Training File'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Task 2.3: Add Navigation Link**

Update the navigation sidebar (usually in `src/app/(dashboard)/layout.tsx` or a navigation component) to include a link to the new page:

```typescript
{
  name: 'LoRA Training Files',
  href: '/training-files',
  icon: FileJson,
}
```

**ACCEPTANCE CRITERIA:**

1. **Training Files Page**:
   - ✅ New page at `/training-files` shows all training files in table
   - ✅ Table shows: name, conversation_count, total_training_pairs, avg_quality_score, scaffolding distribution, file sizes, created_at
   - ✅ Download buttons for both JSON and JSONL formats
   - ✅ Downloads generate signed URLs and open in new tab
   - ✅ Empty state shows helpful message when no files exist
   - ✅ Loading and error states handled gracefully

2. **Conversations Table Integration**:
   - ✅ "Create Training Files" button appears when conversations selected
   - ✅ Button shows conversation count badge
   - ✅ Dropdown opens with "Create New" option and list of existing files
   - ✅ Existing files show name and current conversation count
   - ✅ Selecting "Create New" opens dialog with name and description inputs
   - ✅ Submitting dialog creates training file and clears selection
   - ✅ Selecting existing file adds conversations immediately

3. **Validation & Error Handling**:
   - ✅ Duplicate conversations show clear error message
   - ✅ Non-completed conversations blocked at API level
   - ✅ Empty name validation on client and server
   - ✅ Loading states on all async actions
   - ✅ Toast notifications for success and errors

4. **User Experience**:
   - ✅ Dropdown has max-height with scroll for many files
   - ✅ File names truncated if too long
   - ✅ Consistent iconography (FileJson, Plus, Download)
   - ✅ Responsive design works on desktop

**TESTING STEPS:**

1. Navigate to /training-files, verify empty state
2. Go to conversations page, select 3 conversations
3. Click "Create Training Files", select "Create New"
4. Enter name "Test Training File Alpha", click Create
5. Verify toast success, selection cleared, redirected (or page updated)
6. Navigate back to /training-files, verify file appears
7. Click JSON download, verify file downloads correctly
8. Click JSONL download, verify file downloads correctly
9. Go back to conversations, select 2 more conversations
10. Click "Create Training Files", select existing "Test Training File Alpha"
11. Verify toast success, conversations added
12. Check /training-files page, verify conversation_count increased to 5
13. Try adding duplicate conversation, verify error message

++++++++++++++++++



## Quality Validation Checklist

### Post-Implementation Verification

After completing both prompts:

- [ ] **Database**: training_files and training_file_conversations tables exist with correct schema
- [ ] **Service**: TrainingFileService can create files, add conversations, generate signed URLs
- [ ] **API**: All endpoints functional and return correct data
- [ ] **Full JSON**: Generated files match v4.0 schema exactly (verify with JSON schema validator)
- [ ] **JSONL**: One line per training pair, metadata header present, no null target_responses
- [ ] **Storage**: Files uploaded to correct bucket and paths
- [ ] **UI**: Training files page displays all files with correct information
- [ ] **Dropdown**: "Create Training Files" button works, dropdown shows existing files
- [ ] **Downloads**: Both JSON and JSONL downloads work correctly
- [ ] **Validation**: Non-completed conversations blocked from submission
- [ ] **Duplicates**: Attempting to add duplicate conversation shows error
- [ ] **Bulk Processing**: Can successfully add 80 conversations at once without timeout

### Integration Testing

1. **End-to-End Flow**:
   - Create 5 conversations with enrichment completed
   - Select all 5 on conversations page
   - Create new training file "Integration Test"
   - Verify file appears on training files page
   - Download JSON, verify structure matches schema
   - Download JSONL, verify one line per training pair
   - Add 3 more conversations to same file
   - Verify updated file has 8 conversations
   - Download again, verify both formats updated

2. **Error Scenarios**:
   - Try creating file with no conversations selected → should prevent/error
   - Try adding conversation with enrichment_status='not_started' → should block
   - Try adding same conversation twice → should show duplicate error
   - Try downloading non-existent file → should 404

3. **Performance**:
   - Create training file with 50 conversations → should complete in <30 seconds
   - Download 50-conversation JSONL file → should generate URL quickly
   - Load training files page with 20 files → should render in <2 seconds

---

## Success Criteria

This implementation is successful when:

1. **Users can create new training files** from checked conversations on the conversations page
2. **Users can add conversations to existing files** via the dropdown selector
3. **Full JSON and JSONL files** are generated following the v4.0 schema specification exactly
4. **Download functionality** works for both JSON and JSONL formats
5. **Validation prevents** non-completed or missing-path conversations from being added
6. **Duplicate prevention** blocks adding the same conversation to the same file twice
7. **Bulk processing** handles up to 80 conversations at once without errors
8. **Scaffolding distribution** correctly tracks and displays persona/arc/topic counts
9. **Quality metrics** are accurately aggregated and displayed

---

**Implementation Notes:**

- Use SAOL library for all database operations (safe escaping)
- Follow existing patterns from export-service.ts and conversation-service.ts
- Reuse UI components from Shadcn/UI library
- Test with actual enriched conversation JSON files from your system
- Verify generated JSON matches schema specification exactly using a JSON schema validator

**End of Execution Plan**

