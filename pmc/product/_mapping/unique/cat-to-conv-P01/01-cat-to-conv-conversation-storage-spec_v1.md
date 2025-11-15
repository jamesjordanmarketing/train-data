# Categories-to-Conversations: Conversation Storage System - Implementation Specification

**Generated**: 2025-11-14
**Segment**: Conversation Storage & Management Infrastructure
**Total Prompts**: 3
**Estimated Implementation Time**: 35-50 hours
**Task Inventory Source**: `04-cat-to-conv-templates-spec_v2.md`
**Strategic Foundation**: `04-categories-to-conversation-pipeline_spec_v1.md`

---

## Executive Summary

This specification implements the complete Conversation Storage and Management system for generated LoRA training conversations. It establishes a dual-storage architecture: Supabase Storage for raw JSON conversation files and PostgreSQL tables for metadata, filtering, and workflow management.

**This system is strategically critical because:**

1. **Quality Pipeline Foundation**: Enables review workflow (approved/rejected/pending) for quality control
2. **Storage Optimization**: Separates large JSON files (Supabase Storage) from queryable metadata (PostgreSQL)
3. **Export Readiness**: Provides filtering and batch selection for export to training systems
4. **Audit Trail**: Complete tracking of who generated what, when, with what quality scores
5. **UI Integration**: Powers the `/conversations` dashboard for conversation management

**Key Deliverables:**
- Supabase Storage bucket for conversation JSON files
- `conversations` table with metadata (persona, arc, topic, quality scores, status)
- `conversation_turns` table with normalized turn storage
- Storage service layer for file operations using SAOL
- Enhanced `/conversations` page with filtering and export
- Background processing status tracking
- File retention and cleanup policies

---

## Context and Dependencies

### Referenced Specifications

**Primary Source Documents:**

1. **`04-cat-to-conv-templates-spec_v2.md`** - Main specification
   - Storage handoff requirements (lines 147-181)
   - File output format expectations
   - Metadata extraction needs

2. **`04-categories-to-conversation-pipeline_spec_v1.md`** - Pipeline architecture
   - Defines 5-stage pipeline (lines 35-89)
   - Storage as Stage 4 (lines 75-89)
   - Export as Stage 5 (lines 90-104)

3. **`04-categories-to-conversation-strategic-overview_v1.md`** - Strategic context
   - Quality tiers definition (lines 271-319)
   - Processing status workflow (lines 186-230)

4. **Seed Conversation Schema** - Data structure
   - `c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json`
   - Defines conversation JSON structure
   - Metadata fields to extract

### Current Codebase State

**Existing Infrastructure to Build Upon:**

1. **UI Components** (already exist):
   - `src/app/(dashboard)/conversations/page.tsx` - Conversation dashboard (stub)
   - Component exists but needs backend integration

2. **SAOL Library** (database operations):
   - Location: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
   - Quick Start: `saol-agent-quick-start-guide_v1.md`
   - All database operations must use SAOL patterns

3. **Type Definitions** (need extension):
   - `src/lib/types.ts` - Core application types
   - Need to add: Conversation, ConversationTurn interfaces

4. **Supabase Configuration**:
   - Supabase project already configured
   - Storage bucket creation needed
   - RLS policies needed for multi-tenant isolation

**What This Spec Will Create:**

- `conversation-files` Supabase Storage bucket
- `conversations` PostgreSQL table with metadata
- `conversation_turns` PostgreSQL table with normalized turns
- Storage service at `src/lib/services/conversation-storage-service.ts`
- Enhanced UI at `/conversations` with filtering and export
- File cleanup cron job for expired conversations

### Dependencies

**External Dependencies:**
1. **Supabase PostgreSQL**: Database for conversations and turns tables
2. **Supabase Storage**: Object storage for JSON conversation files
3. **SAOL Library**: All database operations use SAOL
4. **Template Execution System**: Generates conversations that this system stores

**Internal Dependencies:**
1. **Template System (E01)**: Provides generated conversations
2. **Type System**: Extended with Conversation/Turn interfaces
3. **UI Components**: Existing dashboard page enhanced

**Dependencies from Prior Work:**
- E01 (Templates): Provides the generation system that outputs conversations
- Scaffolding data tables: Conversations link to personas, arcs, topics

---

## Implementation Strategy

### Risk Assessment

#### High-Risk Areas

**Risk 1: Large File Storage Costs**
- **Problem**: Storing thousands of JSON conversation files may incur significant storage costs
- **Mitigation**:
  - Implement retention policy (30-90 day expiration)
  - Compress files with gzip before storage
  - Archive approved conversations, delete rejected after 30 days
  - Monitor storage usage with metrics
  - Set storage quota alerts

**Risk 2: File Upload/Download Performance**
- **Problem**: Large JSON files (50KB-200KB) may cause slow UI response
- **Mitigation**:
  - Use streaming uploads for files >50KB
  - Implement presigned URLs for downloads
  - Add loading states in UI during file operations
  - Cache file URLs for 5 minutes
  - Background processing for batch operations

**Risk 3: Metadata-File Sync Issues**
- **Problem**: Conversation metadata may become out of sync with stored files
- **Mitigation**:
  - Use database transactions for metadata + file operations
  - Store file_url and file_size in conversations table
  - Validate file exists before marking conversation as complete
  - Add reconciliation script to detect orphaned files/metadata
  - Log all storage operations for debugging

#### Medium-Risk Areas

**Risk 4: Query Performance on Large Tables**
- **Problem**: Conversations table may grow to 100K+ rows, slowing dashboard queries
- **Mitigation**:
  - Add indexes on frequently filtered columns (status, tier, quality_score, created_at)
  - Use pagination (25 records per page)
  - Implement query result caching (5 minute TTL)
  - Archive old conversations to separate table after 1 year

**Risk 5: RLS Policy Complexity**
- **Problem**: Multi-tenant RLS policies may block legitimate operations
- **Mitigation**:
  - Start with simple RLS (user can see own conversations)
  - Add service role bypass for admin operations
  - Test RLS policies with multiple user accounts
  - Document RLS policy logic clearly

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Database Foundation & Storage Bucket**
- **Why First**: All other components depend on database schema and storage bucket
- **Scope**: Create tables, storage bucket, basic CRUD service
- **Output**: Working database schema and storage infrastructure

**Prompt 2: File Storage Service & Upload/Download**
- **Why Second**: UI integration requires file operations to work
- **Scope**: Storage service layer, file upload/download, metadata extraction
- **Output**: Complete file storage service with SAOL integration

**Prompt 3: UI Integration & Workflow Management**
- **Why Third**: User-facing features depend on backend services
- **Scope**: Enhanced /conversations page, filtering, status management, export
- **Output**: Complete conversation management UI

**Independence Strategy**: Each prompt is self-contained with complete context, though sequential execution is optimal.

### Quality Assurance Approach

**Quality Gates Per Prompt:**

1. **Data Integrity**: All metadata accurately reflects conversation content
2. **File Consistency**: Every conversation record has valid file in storage
3. **Query Performance**: Dashboard loads in <2 seconds for 1000 conversations
4. **UI Responsiveness**: File uploads show progress, downloads work reliably
5. **Workflow Correctness**: Status transitions follow defined rules

**Cross-Prompt Quality Checks:**

- **Type Safety**: All TypeScript interfaces match database schemas
- **Error Handling**: File operations handle network failures gracefully
- **Security**: RLS policies prevent unauthorized access
- **Performance**: Indexed queries, pagination, caching implemented
- **Audit Trail**: All operations logged with user_id and timestamp

---

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor BEFORE implementing prompts.

========================

```sql
-- Migration: Create Conversation Storage Tables
-- Date: 2025-11-14
-- Purpose: Store conversation metadata and manage conversation files

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id VARCHAR(100) UNIQUE NOT NULL,

  -- Scaffolding references
  persona_id UUID REFERENCES personas(id) ON DELETE SET NULL,
  emotional_arc_id UUID REFERENCES emotional_arcs(id) ON DELETE SET NULL,
  training_topic_id UUID REFERENCES training_topics(id) ON DELETE SET NULL,
  template_id UUID REFERENCES prompt_templates(id) ON DELETE SET NULL,

  -- Scaffolding keys (denormalized for query performance)
  persona_key VARCHAR(100),
  emotional_arc_key VARCHAR(100),
  topic_key VARCHAR(100),

  -- Metadata
  conversation_name VARCHAR(255),
  description TEXT,
  turn_count INTEGER NOT NULL,
  tier VARCHAR(50) DEFAULT 'template',
  category VARCHAR(100),

  -- Quality scores
  quality_score NUMERIC(2,1) CHECK (quality_score BETWEEN 1.0 AND 5.0),
  empathy_score NUMERIC(2,1) CHECK (empathy_score BETWEEN 1.0 AND 5.0),
  clarity_score NUMERIC(2,1) CHECK (clarity_score BETWEEN 1.0 AND 5.0),
  appropriateness_score NUMERIC(2,1) CHECK (appropriateness_score BETWEEN 1.0 AND 5.0),
  brand_voice_alignment NUMERIC(2,1) CHECK (brand_voice_alignment BETWEEN 1.0 AND 5.0),

  -- Processing status
  status VARCHAR(50) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'archived')),
  processing_status VARCHAR(50) DEFAULT 'completed' CHECK (processing_status IN ('queued', 'processing', 'completed', 'failed')),

  -- File storage
  file_url TEXT,
  file_size BIGINT,
  file_path TEXT,
  storage_bucket VARCHAR(100) DEFAULT 'conversation-files',

  -- Emotional progression
  starting_emotion VARCHAR(100),
  ending_emotion VARCHAR(100),
  emotional_intensity_start NUMERIC(3,2),
  emotional_intensity_end NUMERIC(3,2),

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_exported_at TIMESTAMPTZ,
  export_count INTEGER DEFAULT 0,

  -- Audit
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Retention
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_conversations_id ON conversations(conversation_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_tier ON conversations(tier);
CREATE INDEX idx_conversations_quality ON conversations(quality_score DESC);
CREATE INDEX idx_conversations_persona ON conversations(persona_id);
CREATE INDEX idx_conversations_arc ON conversations(emotional_arc_id);
CREATE INDEX idx_conversations_topic ON conversations(training_topic_id);
CREATE INDEX idx_conversations_created ON conversations(created_at DESC);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);
CREATE INDEX idx_conversations_processing ON conversations(processing_status);

COMMENT ON TABLE conversations IS 'Metadata for generated LoRA training conversations with file storage references';
COMMENT ON COLUMN conversations.status IS 'Review workflow: pending_review → approved/rejected → archived';
COMMENT ON COLUMN conversations.processing_status IS 'Generation workflow: queued → processing → completed/failed';
COMMENT ON COLUMN conversations.file_url IS 'Presigned URL or public URL to conversation JSON file in Supabase Storage';

-- ============================================================================
-- CONVERSATION TURNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  turn_number INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),

  -- Turn content
  content TEXT NOT NULL,

  -- Emotional context (from JSON)
  detected_emotion VARCHAR(100),
  emotion_confidence NUMERIC(3,2),
  emotional_intensity NUMERIC(3,2),

  -- Response strategy (assistant turns only)
  primary_strategy VARCHAR(255),
  tone VARCHAR(100),

  -- Quality metrics
  word_count INTEGER,
  sentence_count INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_conversation_turn UNIQUE (conversation_id, turn_number)
);

CREATE INDEX idx_turns_conversation ON conversation_turns(conversation_id);
CREATE INDEX idx_turns_number ON conversation_turns(conversation_id, turn_number);
CREATE INDEX idx_turns_role ON conversation_turns(role);

COMMENT ON TABLE conversation_turns IS 'Normalized storage of individual conversation turns for querying and analysis';
COMMENT ON COLUMN conversation_turns.content IS 'The actual text content of the turn (user input or assistant response)';

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = created_by);

-- RLS Policy: Users can create their own conversations
CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = created_by);

-- RLS Policy: Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policy: Users can view turns for their conversations
CREATE POLICY "Users can view own conversation turns"
  ON conversation_turns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_turns.conversation_id
      AND conversations.created_by = auth.uid()
    )
  );

-- RLS Policy: Users can create turns for their conversations
CREATE POLICY "Users can create own conversation turns"
  ON conversation_turns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_turns.conversation_id
      AND conversations.created_by = auth.uid()
    )
  );

-- ============================================================================
-- STORAGE BUCKET SETUP (Execute in Supabase Dashboard → Storage)
-- ============================================================================

-- Note: Storage bucket creation is done via Supabase Dashboard or API, not SQL
-- Create bucket named: conversation-files
-- Settings:
--   - Public: false (requires authentication)
--   - File size limit: 10MB
--   - Allowed MIME types: application/json
--   - Enable RLS policies

-- Storage RLS Policy: Users can upload to their own folder
-- Policy name: "Users can upload to own folder"
-- Operation: INSERT
-- Policy definition:
-- (bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Storage RLS Policy: Users can read from their own folder
-- Policy name: "Users can read from own folder"
-- Operation: SELECT
-- Policy definition:
-- (bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Storage RLS Policy: Users can update their own files
-- Policy name: "Users can update own files"
-- Operation: UPDATE
-- Policy definition:
-- (bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text)

-- Storage RLS Policy: Users can delete their own files
-- Policy name: "Users can delete own files"
-- Operation: DELETE
-- Policy definition:
-- (bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text)

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify tables created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('conversations', 'conversation_turns')
ORDER BY table_name, ordinal_position;

-- Verify indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('conversations', 'conversation_turns')
ORDER BY tablename, indexname;

-- Verify foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('conversations', 'conversation_turns')
ORDER BY tc.table_name;
```

**Validation Steps:**
1. Run the migration in Supabase SQL Editor
2. Verify both tables created with all columns
3. Verify all indexes created
4. Verify foreign keys to personas, emotional_arcs, training_topics, prompt_templates
5. Verify RLS enabled on both tables
6. Create `conversation-files` storage bucket in Supabase Dashboard → Storage
7. Configure storage bucket RLS policies as specified above

++++++++++++++++++

---

## Implementation Prompts

### Prompt 1: Database Foundation & Storage Service Core

**Scope**: Verify tables created, implement conversation storage service CRUD operations
**Dependencies**: Tables and storage bucket created (migration above), SAOL library
**Estimated Time**: 12-15 hours
**Risk Level**: Low-Medium

========================

You are a senior backend developer implementing the Conversation Storage Service Foundation for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Conversation Storage Service manages the complete lifecycle of generated training conversations: file storage in Supabase Storage, metadata persistence in PostgreSQL, and workflow management (review, approval, export). This prompt establishes the core CRUD service layer.

**Storage Architecture:**
- **Files**: Conversation JSON files stored in Supabase Storage bucket `conversation-files`
- **Metadata**: Conversation metadata in `conversations` PostgreSQL table
- **Turns**: Individual conversation turns in `conversation_turns` table for querying
- **Dual-Write**: File upload + metadata insert must be atomic (transactional)

**File Organization:**
```
conversation-files/
  {user_id}/
    {conversation_id}/
      conversation.json
      metadata.json (optional)
```

**CURRENT CODEBASE STATE:**

**Database Schema** (Already Created):
- `conversations` table with fields: id, conversation_id, persona_id, emotional_arc_id, quality_score, status, file_url, etc.
- `conversation_turns` table with fields: id, conversation_id, turn_number, role, content, detected_emotion, etc.
- Storage bucket `conversation-files` created with RLS policies

**SAOL Library Usage** (Required):
- **Library Location**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- **Quick Start**: `supa-agent-ops\saol-agent-quick-start-guide_v1.md`
- **Key Functions**:
  - `agentImportTool({ source, table, mode, onConflict })` - Insert/update data
  - `agentQuery({ table, where, limit, orderBy })` - Query data
  - `agentCount({ table, where })` - Count records
  - `agentDelete({ table, where, confirm })` - Delete records

**Supabase Storage Client** (for file operations):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Upload file
const { data, error } = await supabase.storage
  .from('conversation-files')
  .upload(`${userId}/${conversationId}/conversation.json`, fileContent, {
    contentType: 'application/json',
    upsert: true
  });

// Download file
const { data, error } = await supabase.storage
  .from('conversation-files')
  .download(`${userId}/${conversationId}/conversation.json`);

// Get public URL (for authenticated users)
const { data } = supabase.storage
  .from('conversation-files')
  .getPublicUrl(`${userId}/${conversationId}/conversation.json`);
```

**IMPLEMENTATION TASKS:**

**Task T-1.1: Create Type Definitions**

Create `src/lib/types/conversations.ts` with conversation interfaces.

```typescript
export interface Conversation {
  id: string;
  conversation_id: string;

  // Scaffolding references
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;

  // Scaffolding keys
  persona_key: string | null;
  emotional_arc_key: string | null;
  topic_key: string | null;

  // Metadata
  conversation_name: string | null;
  description: string | null;
  turn_count: number;
  tier: 'template' | 'scenario' | 'edge_case';
  category: string | null;

  // Quality scores
  quality_score: number | null;
  empathy_score: number | null;
  clarity_score: number | null;
  appropriateness_score: number | null;
  brand_voice_alignment: number | null;

  // Processing status
  status: 'pending_review' | 'approved' | 'rejected' | 'archived';
  processing_status: 'queued' | 'processing' | 'completed' | 'failed';

  // File storage
  file_url: string | null;
  file_size: number | null;
  file_path: string | null;
  storage_bucket: string;

  // Emotional progression
  starting_emotion: string | null;
  ending_emotion: string | null;
  emotional_intensity_start: number | null;
  emotional_intensity_end: number | null;

  // Usage tracking
  usage_count: number;
  last_exported_at: string | null;
  export_count: number;

  // Audit
  created_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;

  // Retention
  expires_at: string | null;
  is_active: boolean;
}

export interface ConversationTurn {
  id: string;
  conversation_id: string;
  turn_number: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  detected_emotion: string | null;
  emotion_confidence: number | null;
  emotional_intensity: number | null;
  primary_strategy: string | null;
  tone: string | null;
  word_count: number | null;
  sentence_count: number | null;
  created_at: string;
}

export interface ConversationJSONFile {
  dataset_metadata: {
    dataset_name: string;
    version: string;
    created_date: string;
    vertical: string;
    consultant_persona: string;
    target_use: string;
    conversation_source: string;
    quality_tier: string;
    total_conversations: number;
    total_turns: number;
    notes: string;
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
  training_pairs: Array<{
    id: string;
    conversation_id: string;
    turn_number: number;
    conversation_metadata?: any;
    system_prompt: string;
    conversation_history: any[];
    current_user_input: string;
    emotional_context: any;
    response_strategy: any;
    target_response: string;
    response_breakdown: any;
    expected_user_response_patterns: any;
    training_metadata: any;
  }>;
}

export interface CreateConversationInput {
  conversation_id: string;
  persona_id?: string;
  emotional_arc_id?: string;
  training_topic_id?: string;
  template_id?: string;
  conversation_name?: string;
  file_content: ConversationJSONFile | string;
  created_by: string;
}
```

**Task T-1.2: Create Conversation Storage Service**

Create `src/lib/services/conversation-storage-service.ts` with SAOL integration.

```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Conversation, ConversationTurn, ConversationJSONFile, CreateConversationInput } from '../types/conversations';

export class ConversationStorageService {
  private supabase: SupabaseClient;
  private saol: any;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    this.saol = require('../../../supa-agent-ops');
  }

  /**
   * Create conversation: Upload file to storage + insert metadata + extract turns
   * This is an atomic operation - if any step fails, rollback
   */
  async createConversation(input: CreateConversationInput): Promise<Conversation> {
    try {
      const userId = input.created_by;
      const conversationId = input.conversation_id;

      // Step 1: Parse conversation content
      const conversationData: ConversationJSONFile =
        typeof input.file_content === 'string'
          ? JSON.parse(input.file_content)
          : input.file_content;

      // Step 2: Upload file to Supabase Storage
      const filePath = `${userId}/${conversationId}/conversation.json`;
      const fileContent = JSON.stringify(conversationData, null, 2);
      const fileBlob = new Blob([fileContent], { type: 'application/json' });

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from('conversation-files')
        .upload(filePath, fileBlob, {
          contentType: 'application/json',
          upsert: true
        });

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Step 3: Get file URL
      const { data: urlData } = this.supabase.storage
        .from('conversation-files')
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      // Step 4: Extract metadata from conversation JSON
      const metadata = this.extractMetadata(conversationData, conversationId);

      // Step 5: Insert conversation metadata using SAOL
      const conversationRecord = {
        conversation_id: conversationId,
        persona_id: input.persona_id || null,
        emotional_arc_id: input.emotional_arc_id || null,
        training_topic_id: input.training_topic_id || null,
        template_id: input.template_id || null,
        conversation_name: input.conversation_name || metadata.conversation_name,
        turn_count: metadata.turn_count,
        tier: metadata.tier,
        quality_score: metadata.quality_score,
        empathy_score: metadata.empathy_score,
        clarity_score: metadata.clarity_score,
        appropriateness_score: metadata.appropriateness_score,
        brand_voice_alignment: metadata.brand_voice_alignment,
        status: 'pending_review',
        processing_status: 'completed',
        file_url: fileUrl,
        file_size: fileBlob.size,
        file_path: filePath,
        storage_bucket: 'conversation-files',
        starting_emotion: metadata.starting_emotion,
        ending_emotion: metadata.ending_emotion,
        created_by: userId,
        is_active: true
      };

      const importResult = await this.saol.agentImportTool({
        source: [conversationRecord],
        table: 'conversations',
        mode: 'insert'
      });

      if (!importResult.success) {
        // Rollback: Delete uploaded file
        await this.supabase.storage.from('conversation-files').remove([filePath]);
        throw new Error(`Metadata insert failed: ${importResult.summary}`);
      }

      // Step 6: Extract and insert conversation turns
      const turns = this.extractTurns(conversationData, conversationId);

      // Get the conversation ID from database
      const queryResult = await this.saol.agentQuery({
        table: 'conversations',
        where: [{ column: 'conversation_id', operator: 'eq', value: conversationId }],
        limit: 1
      });

      const conversation = queryResult.data[0] as Conversation;

      // Insert turns with conversation FK
      const turnsWithFK = turns.map(turn => ({
        ...turn,
        conversation_id: conversation.id
      }));

      await this.saol.agentImportTool({
        source: turnsWithFK,
        table: 'conversation_turns',
        mode: 'insert'
      });

      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const result = await this.saol.agentQuery({
      table: 'conversations',
      where: [{ column: 'conversation_id', operator: 'eq', value: conversationId }],
      limit: 1
    });

    if (!result.data || result.data.length === 0) {
      return null;
    }

    return result.data[0] as Conversation;
  }

  /**
   * List conversations with filtering
   */
  async listConversations(filters?: {
    status?: Conversation['status'];
    tier?: Conversation['tier'];
    persona_id?: string;
    emotional_arc_id?: string;
    created_by?: string;
    quality_min?: number;
  }, pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    const whereConditions: any[] = [];

    if (filters?.status) {
      whereConditions.push({ column: 'status', operator: 'eq', value: filters.status });
    }
    if (filters?.tier) {
      whereConditions.push({ column: 'tier', operator: 'eq', value: filters.tier });
    }
    if (filters?.persona_id) {
      whereConditions.push({ column: 'persona_id', operator: 'eq', value: filters.persona_id });
    }
    if (filters?.emotional_arc_id) {
      whereConditions.push({ column: 'emotional_arc_id', operator: 'eq', value: filters.emotional_arc_id });
    }
    if (filters?.created_by) {
      whereConditions.push({ column: 'created_by', operator: 'eq', value: filters.created_by });
    }
    if (filters?.quality_min) {
      whereConditions.push({ column: 'quality_score', operator: 'gte', value: filters.quality_min });
    }

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 25;

    // Note: SAOL agentQuery doesn't support offset, so we'll use Supabase client directly
    let query = this.supabase
      .from('conversations')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    whereConditions.forEach(condition => {
      query = query.eq(condition.column, condition.value);
    });

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      conversations: (data || []) as Conversation[],
      total: count || 0
    };
  }

  /**
   * Update conversation status (approve/reject)
   */
  async updateConversationStatus(
    conversationId: string,
    status: Conversation['status'],
    reviewedBy: string,
    reviewNotes?: string
  ): Promise<Conversation> {
    // Get conversation first
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    // Update using Supabase client (SAOL doesn't have native update)
    const { data, error } = await this.supabase
      .from('conversations')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes || null,
        updated_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .select()
      .single();

    if (error) throw error;

    return data as Conversation;
  }

  /**
   * Download conversation file from storage
   */
  async downloadConversationFile(filePath: string): Promise<ConversationJSONFile> {
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .download(filePath);

    if (error) {
      throw new Error(`File download failed: ${error.message}`);
    }

    const text = await data.text();
    return JSON.parse(text) as ConversationJSONFile;
  }

  /**
   * Delete conversation (soft delete by default)
   */
  async deleteConversation(conversationId: string, hard: boolean = false): Promise<void> {
    if (hard) {
      // Hard delete: Remove file from storage + delete database record
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return;

      // Delete file
      if (conversation.file_path) {
        await this.supabase.storage
          .from('conversation-files')
          .remove([conversation.file_path]);
      }

      // Delete database record (cascade will delete turns)
      await this.saol.agentDelete({
        table: 'conversations',
        where: [{ column: 'conversation_id', operator: 'eq', value: conversationId }],
        confirm: true
      });
    } else {
      // Soft delete: Set is_active = false
      await this.supabase
        .from('conversations')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('conversation_id', conversationId);
    }
  }

  // ========================================================================
  // PRIVATE HELPER METHODS
  // ========================================================================

  private extractMetadata(conversationData: ConversationJSONFile, conversationId: string): any {
    const metadata = conversationData.dataset_metadata;
    const firstTurn = conversationData.training_pairs[0];
    const lastTurn = conversationData.training_pairs[conversationData.training_pairs.length - 1];

    return {
      conversation_name: metadata.dataset_name || conversationId,
      turn_count: metadata.total_turns,
      tier: metadata.quality_tier === 'seed_dataset' ? 'template' : metadata.quality_tier,
      quality_score: firstTurn?.training_metadata?.quality_score || null,
      empathy_score: firstTurn?.training_metadata?.quality_criteria?.empathy_score || null,
      clarity_score: firstTurn?.training_metadata?.quality_criteria?.clarity_score || null,
      appropriateness_score: firstTurn?.training_metadata?.quality_criteria?.appropriateness_score || null,
      brand_voice_alignment: firstTurn?.training_metadata?.quality_criteria?.brand_voice_alignment || null,
      starting_emotion: firstTurn?.emotional_context?.detected_emotions?.primary || null,
      ending_emotion: lastTurn?.emotional_context?.detected_emotions?.primary || null
    };
  }

  private extractTurns(conversationData: ConversationJSONFile, conversationId: string): Omit<ConversationTurn, 'id' | 'created_at'>[] {
    return conversationData.training_pairs.map(pair => ({
      conversation_id: '', // Will be set with FK later
      turn_number: pair.turn_number,
      role: 'assistant', // Training pairs are assistant responses
      content: pair.target_response,
      detected_emotion: pair.emotional_context?.detected_emotions?.primary || null,
      emotion_confidence: pair.emotional_context?.detected_emotions?.primary_confidence || null,
      emotional_intensity: pair.emotional_context?.detected_emotions?.intensity || null,
      primary_strategy: pair.response_strategy?.primary_strategy || null,
      tone: pair.response_strategy?.tone_selection || null,
      word_count: pair.target_response.split(/\s+/).length,
      sentence_count: pair.target_response.split(/[.!?]+/).filter(Boolean).length
    }));
  }
}

// Export singleton instance
export const conversationStorageService = new ConversationStorageService();
```

**ACCEPTANCE CRITERIA:**

1. **Service Implementation**:
   - ✅ ConversationStorageService class created with all methods
   - ✅ createConversation() uploads file + inserts metadata + extracts turns atomically
   - ✅ getConversation() retrieves by conversation_id
   - ✅ listConversations() supports filtering and pagination
   - ✅ updateConversationStatus() updates status and review fields
   - ✅ downloadConversationFile() retrieves JSON from storage
   - ✅ deleteConversation() supports soft and hard delete

2. **Type Safety**:
   - ✅ All interfaces match database schema
   - ✅ TypeScript strict mode passes
   - ✅ No any types except where necessary

3. **Error Handling**:
   - ✅ File upload errors handled gracefully
   - ✅ Rollback on metadata insert failure
   - ✅ Not found errors return null (get) or throw (update/delete)

4. **Integration**:
   - ✅ SAOL used for database operations
   - ✅ Supabase client used for storage operations
   - ✅ File paths follow {userId}/{conversationId}/conversation.json pattern

**VALIDATION REQUIREMENTS:**

1. **Test Create Conversation:**
   ```typescript
   const service = new ConversationStorageService();

   // Load sample conversation JSON
   const sampleConversation = JSON.parse(fs.readFileSync('./data/sample-conversation.json', 'utf-8'));

   const result = await service.createConversation({
     conversation_id: 'test-convo-001',
     persona_id: '{persona-uuid}',
     emotional_arc_id: '{arc-uuid}',
     file_content: sampleConversation,
     created_by: '{user-uuid}'
   });

   console.assert(result.conversation_id === 'test-convo-001', 'ID matches');
   console.assert(result.file_url, 'File URL exists');
   ```

2. **Test List Conversations:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'conversations',where:[{column:'status',operator:'eq',value:'pending_review'}],limit:10});console.log('Pending conversations:',r.data.length);})();"
   ```

3. **Test File Download:**
   - Get conversation with file_path
   - Call downloadConversationFile(filePath)
   - Verify JSON structure matches ConversationJSONFile interface

++++++++++++++++++

---

### Prompt 2: File Upload/Download & Metadata Extraction

**Scope**: Enhance storage service with batch operations, metadata extraction refinement, file validation
**Dependencies**: Storage service core (Prompt 1), conversation JSON schema
**Estimated Time**: 10-12 hours
**Risk Level**: Medium

========================

You are a senior backend developer enhancing the Conversation Storage Service with batch operations and advanced metadata extraction.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This prompt adds production-grade features to the conversation storage service: batch file uploads for multiple conversations, advanced metadata extraction from complex JSON structures, file validation, and error recovery.

**Key Features to Add:**
1. **Batch Upload**: Upload multiple conversations in one operation
2. **Metadata Extraction**: Parse all quality metrics, emotional progression, persona details
3. **File Validation**: Verify JSON schema compliance before storage
4. **Error Recovery**: Handle partial failures in batch operations
5. **Presigned URLs**: Generate presigned URLs for secure downloads

**CURRENT CODEBASE STATE:**

**Existing Service**: `src/lib/services/conversation-storage-service.ts`
- Basic create, read, update, delete operations
- Single file upload/download
- Basic metadata extraction

**JSON Schema Validation**: Need to add JSON schema validation for conversation files

**IMPLEMENTATION TASKS:**

**Task T-2.1: Add JSON Schema Validation**

Create `src/lib/validators/conversation-schema.ts` with JSON schema validation.

```typescript
import Ajv from 'ajv';
import type { ConversationJSONFile } from '../types/conversations';

const ajv = new Ajv();

// Define JSON schema for conversation files
const conversationSchema = {
  type: 'object',
  required: ['dataset_metadata', 'consultant_profile', 'training_pairs'],
  properties: {
    dataset_metadata: {
      type: 'object',
      required: ['dataset_name', 'version', 'total_turns'],
      properties: {
        dataset_name: { type: 'string' },
        version: { type: 'string' },
        created_date: { type: 'string' },
        total_conversations: { type: 'number' },
        total_turns: { type: 'number' }
      }
    },
    consultant_profile: { type: 'object' },
    training_pairs: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'conversation_id', 'turn_number', 'target_response'],
        properties: {
          id: { type: 'string' },
          conversation_id: { type: 'string' },
          turn_number: { type: 'number' },
          target_response: { type: 'string' }
        }
      }
    }
  }
};

const validate = ajv.compile(conversationSchema);

export function validateConversationJSON(data: any): { valid: boolean; errors: string[] } {
  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map(err =>
    `${err.instancePath} ${err.message}`
  );

  return { valid: false, errors };
}
```

**Task T-2.2: Add Batch Upload Method**

Extend `ConversationStorageService` with batch upload capability.

```typescript
// Add to ConversationStorageService class

/**
 * Batch create conversations
 * Uploads multiple conversations, tracks success/failure for each
 */
async batchCreateConversations(
  inputs: CreateConversationInput[]
): Promise<{
  successful: Conversation[];
  failed: Array<{ input: CreateConversationInput; error: string }>;
}> {
  const successful: Conversation[] = [];
  const failed: Array<{ input: CreateConversationInput; error: string }> = [];

  for (const input of inputs) {
    try {
      const conversation = await this.createConversation(input);
      successful.push(conversation);
    } catch (error) {
      failed.push({
        input,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { successful, failed };
}
```

**Task T-2.3: Add Presigned URL Generation**

Add method to generate presigned URLs for secure file downloads.

```typescript
// Add to ConversationStorageService class

/**
 * Generate presigned URL for file download (valid for 1 hour)
 */
async getPresignedDownloadUrl(filePath: string): Promise<string> {
  const { data, error } = await this.supabase.storage
    .from('conversation-files')
    .createSignedUrl(filePath, 3600); // 1 hour expiration

  if (error) {
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }

  return data.signedUrl;
}
```

**Task T-2.4: Enhanced Metadata Extraction**

Improve `extractMetadata` to capture all quality metrics and emotional progression.

```typescript
private extractMetadata(conversationData: ConversationJSONFile, conversationId: string): any {
  const metadata = conversationData.dataset_metadata;
  const trainingPairs = conversationData.training_pairs;

  if (!trainingPairs || trainingPairs.length === 0) {
    throw new Error('No training pairs found in conversation data');
  }

  const firstTurn = trainingPairs[0];
  const lastTurn = trainingPairs[trainingPairs.length - 1];

  // Extract quality scores from first turn's training metadata
  const trainingMeta = firstTurn.training_metadata || {};
  const qualityCriteria = trainingMeta.quality_criteria || {};

  // Extract emotional progression
  const startEmotions = firstTurn.emotional_context?.detected_emotions || {};
  const endEmotions = lastTurn.emotional_context?.detected_emotions || {};

  return {
    conversation_name: metadata.dataset_name || conversationId,
    description: metadata.notes || null,
    turn_count: metadata.total_turns,
    tier: this.mapQualityTierToTier(metadata.quality_tier),
    category: metadata.vertical || null,

    // Quality scores
    quality_score: trainingMeta.quality_score || null,
    empathy_score: qualityCriteria.empathy_score || null,
    clarity_score: qualityCriteria.clarity_score || null,
    appropriateness_score: qualityCriteria.appropriateness_score || null,
    brand_voice_alignment: qualityCriteria.brand_voice_alignment || null,

    // Emotional progression
    starting_emotion: startEmotions.primary || null,
    ending_emotion: endEmotions.primary || null,
    emotional_intensity_start: startEmotions.intensity || null,
    emotional_intensity_end: endEmotions.intensity || null
  };
}

private mapQualityTierToTier(qualityTier: string): 'template' | 'scenario' | 'edge_case' {
  const mapping: Record<string, 'template' | 'scenario' | 'edge_case'> = {
    'seed_dataset': 'template',
    'template': 'template',
    'scenario': 'scenario',
    'edge_case': 'edge_case'
  };
  return mapping[qualityTier] || 'template';
}
```

**ACCEPTANCE CRITERIA:**

1. **JSON Validation**:
   - ✅ Schema validator catches missing required fields
   - ✅ Schema validator returns clear error messages
   - ✅ Valid JSON passes validation

2. **Batch Upload**:
   - ✅ Multiple conversations uploaded in one call
   - ✅ Partial failures tracked and returned
   - ✅ Successful uploads complete even if some fail

3. **Presigned URLs**:
   - ✅ URLs generated with 1-hour expiration
   - ✅ URLs work for authenticated users
   - ✅ Expired URLs return 403

4. **Enhanced Metadata**:
   - ✅ All quality scores extracted correctly
   - ✅ Emotional progression captured
   - ✅ Tier mapping works for all quality_tier values

**VALIDATION REQUIREMENTS:**

1. **Test JSON Validation:**
   ```typescript
   // Test invalid JSON
   const invalidData = { dataset_metadata: {} }; // Missing required fields
   const result = validateConversationJSON(invalidData);
   console.assert(!result.valid, 'Invalid JSON detected');
   console.log('Errors:', result.errors);
   ```

2. **Test Batch Upload:**
   ```typescript
   const service = new ConversationStorageService();
   const results = await service.batchCreateConversations([
     { conversation_id: 'test-001', file_content: validConvo1, created_by: userId },
     { conversation_id: 'test-002', file_content: invalidConvo, created_by: userId },
     { conversation_id: 'test-003', file_content: validConvo2, created_by: userId }
   ]);

   console.log('Successful:', results.successful.length); // Should be 2
   console.log('Failed:', results.failed.length); // Should be 1
   ```

3. **Test Presigned URL:**
   - Generate presigned URL for a conversation file
   - Verify URL is accessible
   - Wait 1 hour and verify URL expires

++++++++++++++++++

---

### Prompt 3: UI Integration & Conversation Management Dashboard

**Scope**: Enhance /conversations page with filtering, status management, export, file viewing
**Dependencies**: Storage service complete, conversation API endpoints
**Estimated Time**: 13-18 hours
**Risk Level**: Medium

========================

You are a senior full-stack developer implementing the Conversation Management Dashboard UI for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Conversation Management Dashboard (`/conversations`) is where users view, filter, review, approve/reject, and export generated training conversations. This UI integrates with the conversation storage service to provide a complete management experience.

**Key Features**:
1. **Conversation Table**: Sortable, filterable table showing all conversations
2. **Status Management**: Approve/reject conversations with review notes
3. **Filtering**: Filter by status, tier, persona, arc, quality score
4. **File Viewing**: View conversation JSON in modal
5. **Export**: Select multiple conversations for export
6. **Pagination**: Handle large conversation lists efficiently

**CURRENT CODEBASE STATE:**

**Existing UI**: `src/app/(dashboard)/conversations/page.tsx`
- Stub component exists
- Needs full implementation

**Existing Components** (from Shadcn/UI):
- Table, TableHeader, TableRow, TableCell
- Button, Badge, Select, Dialog, Sheet
- Input, Checkbox

**API Route Pattern**: Next.js 14 App Router
- Create API routes at `src/app/api/conversations/*`

**IMPLEMENTATION TASKS:**

**Task T-3.1: Create Conversation API Endpoints**

Create `src/app/api/conversations/route.ts` for listing conversations.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { conversationStorageService } from '@/lib/services/conversation-storage-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract filters
    const status = searchParams.get('status') as any;
    const tier = searchParams.get('tier') as any;
    const persona_id = searchParams.get('persona_id') || undefined;
    const emotional_arc_id = searchParams.get('emotional_arc_id') || undefined;
    const quality_min = searchParams.get('quality_min')
      ? parseFloat(searchParams.get('quality_min')!)
      : undefined;

    // Extract pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');

    // Get user ID from auth (placeholder - implement with actual auth)
    const userId = request.headers.get('x-user-id') || 'test-user';

    const result = await conversationStorageService.listConversations(
      { status, tier, persona_id, emotional_arc_id, quality_min, created_by: userId },
      { page, limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing conversations:', error);
    return NextResponse.json(
      { error: 'Failed to list conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get user ID from auth
    const userId = request.headers.get('x-user-id') || 'test-user';

    const conversation = await conversationStorageService.createConversation({
      ...body,
      created_by: userId
    });

    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
```

Create `src/app/api/conversations/[id]/status/route.ts` for status updates.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { conversationStorageService } from '@/lib/services/conversation-storage-service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, review_notes } = body;

    const userId = request.headers.get('x-user-id') || 'test-user';

    const conversation = await conversationStorageService.updateConversationStatus(
      params.id,
      status,
      userId,
      review_notes
    );

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error updating conversation status:', error);
    return NextResponse.json(
      { error: 'Failed to update conversation status' },
      { status: 500 }
    );
  }
}
```

**Task T-3.2: Implement Conversation Dashboard UI**

Update `src/app/(dashboard)/conversations/page.tsx` with full implementation.

```typescript
'use client';

import { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { Conversation } from '@/lib/types/conversations';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: '',
    tier: '',
    quality_min: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0
  });
  const [viewingConversation, setViewingConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    loadConversations();
  }, [filters, pagination.page]);

  async function loadConversations() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.tier && { tier: filters.tier }),
        ...(filters.quality_min && { quality_min: filters.quality_min })
      });

      const response = await fetch(`/api/conversations?${params}`);
      const data = await response.json();

      setConversations(data.conversations);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(conversationId: string, status: string) {
    try {
      await fetch(`/api/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      loadConversations();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">Manage generated training conversations</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select value={filters.status} onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.tier} onValueChange={value => setFilters(prev => ({ ...prev, tier: value }))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tiers</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
            <SelectItem value="edge_case">Edge Case</SelectItem>
          </SelectContent>
        </Select>

        {selectedIds.length > 0 && (
          <Button variant="outline">
            Export Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Conversation</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Turns</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : conversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No conversations found
                </TableCell>
              </TableRow>
            ) : (
              conversations.map(conversation => (
                <TableRow key={conversation.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(conversation.id)}
                      onCheckedChange={() => toggleSelection(conversation.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{conversation.conversation_name}</div>
                    <div className="text-sm text-muted-foreground">{conversation.conversation_id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{conversation.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{conversation.quality_score?.toFixed(1) || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">/5.0</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        conversation.status === 'approved' ? 'default' :
                        conversation.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {conversation.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{conversation.turn_count}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingConversation(conversation)}
                      >
                        View
                      </Button>
                      {conversation.status === 'pending_review' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatus(conversation.conversation_id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(conversation.conversation_id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} conversations
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.page * pagination.limit >= pagination.total}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      </div>

      {/* View Conversation Dialog */}
      {viewingConversation && (
        <Dialog open={!!viewingConversation} onOpenChange={() => setViewingConversation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingConversation.conversation_name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {viewingConversation.conversation_id}
                </div>
                <div>
                  <span className="font-medium">Tier:</span> {viewingConversation.tier}
                </div>
                <div>
                  <span className="font-medium">Quality Score:</span> {viewingConversation.quality_score}/5.0
                </div>
                <div>
                  <span className="font-medium">Turn Count:</span> {viewingConversation.turn_count}
                </div>
                <div>
                  <span className="font-medium">Starting Emotion:</span> {viewingConversation.starting_emotion}
                </div>
                <div>
                  <span className="font-medium">Ending Emotion:</span> {viewingConversation.ending_emotion}
                </div>
              </div>

              <div>
                <Button
                  variant="outline"
                  onClick={() => window.open(viewingConversation.file_url || '', '_blank')}
                >
                  Download JSON File
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

**ACCEPTANCE CRITERIA:**

1. **API Endpoints**:
   - ✅ GET /api/conversations returns paginated list
   - ✅ POST /api/conversations creates new conversation
   - ✅ PATCH /api/conversations/[id]/status updates status
   - ✅ All endpoints handle errors gracefully

2. **UI Features**:
   - ✅ Conversation table displays all metadata
   - ✅ Filtering works for status, tier, quality
   - ✅ Pagination works correctly
   - ✅ Approve/Reject buttons update status
   - ✅ View dialog shows conversation details
   - ✅ Bulk selection for export

3. **Performance**:
   - ✅ Page loads in <2 seconds for 1000 conversations
   - ✅ Filtering triggers new query, not client-side filter
   - ✅ Loading states shown during async operations

**VALIDATION REQUIREMENTS:**

1. **Test Conversation List:**
   - Navigate to `/conversations`
   - Verify table displays conversations
   - Test filtering and pagination

2. **Test Status Updates:**
   - Click "Approve" on a pending conversation
   - Verify status changes to "approved"
   - Verify reviewed_by and reviewed_at populated

3. **Test Bulk Selection:**
   - Select multiple conversations
   - Verify "Export Selected" button appears
   - Verify count matches selection

++++++++++++++++++

---

## Success Criteria

**Conversation Storage System Complete When:**

1. ✅ Database tables and storage bucket created
   - conversations table with all metadata fields
   - conversation_turns table for normalized storage
   - conversation-files storage bucket with RLS

2. ✅ Storage service operational
   - File upload/download works reliably
   - Metadata extraction captures all quality scores
   - Batch operations handle partial failures

3. ✅ UI integration complete
   - /conversations page displays conversations
   - Filtering and pagination functional
   - Status management (approve/reject) works
   - File viewing available

4. ✅ Quality validation
   - All conversations have valid file_url
   - Metadata accurately reflects file content
   - No orphaned files or metadata

5. ✅ Performance acceptable
   - Dashboard loads in <2s for 1000 conversations
   - File uploads complete in <5s for 200KB files
   - Presigned URLs generated instantly

---

**Document Status:** Implementation specification ready for execution
**Total Prompts:** 3
**Sequential Execution Recommended:** Yes
**Estimated Total Time:** 35-50 hours
