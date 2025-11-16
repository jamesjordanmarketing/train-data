# Categories-to-Conversations: Conversation Storage System - Implementation Specification v2

**Generated**: 2025-11-15
**Version**: v2 (Updated from v1)
**Segment**: Conversation Storage & Management Infrastructure
**Total Prompts**: 3
**Estimated Implementation Time**: 35-50 hours
**Task Inventory Source**: `04-cat-to-conv-templates-spec_v2.md`
**Strategic Foundation**: `04-categories-to-conversation-pipeline_spec_v1.md`

---

## Document Changes (v1 → v2)

**KEY UPDATES IN V2:**

1. **Database Setup Method Changed**: Section "Required SQL Operations" has been completely rewritten to use the Supabase Agent Ops Library (SAOL) instead of manual SQL execution. This provides:
   - Automatic character escaping for special characters
   - Intelligent error reporting with `nextActions` guidance
   - Preflight validation before operations
   - Dry-run capability to test before executing
   - Consistent error handling

2. **Current Implementation Note**: Added clarification that:
   - `conversation-service.ts` exists (not `conversation-storage-service.ts` as originally spec'd)
   - Supabase Storage bucket creation is documented but filesystem storage may be used initially
   - The database schema in this spec is a reference - the actual implementation may vary

3. **SAOL Integration**: All prompts now reference SAOL Quick Start Guide for database operations

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
- Supabase Storage bucket for conversation JSON files (optional - may use filesystem initially)
- `conversations` table with metadata (persona, arc, topic, quality scores, status)
- `conversation_turns` table with normalized turn storage
- Conversation service layer using SAOL for all database operations
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

**IMPORTANT NOTE ON CURRENT IMPLEMENTATION:**

The current codebase already has a comprehensive conversation system implemented. This spec serves as a reference for the intended architecture. The actual implementation may use:
- `conversation-service.ts` instead of `conversation-storage-service.ts`
- Filesystem storage (via `src/lib/backup/storage.ts`) instead of Supabase Storage
- More extensive database schema than shown here

**Existing Infrastructure to Build Upon:**

1. **UI Components** (already exist):
   - `src/app/(dashboard)/conversations/page.tsx` - Conversation dashboard
   - Component may already be implemented or partially implemented

2. **SAOL Library** (database operations):
   - Location: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
   - Quick Start: `saol-agent-quick-start-guide_v1.md`
   - **All database operations MUST use SAOL patterns** (v2 change)

3. **Type Definitions**:
   - `src/lib/types/conversations.ts` - May already contain Conversation, ConversationTurn interfaces
   - Verify current types before creating new ones

4. **Supabase Configuration**:
   - Supabase project already configured
   - Storage bucket creation needed (or filesystem alternative)
   - RLS policies needed for multi-tenant isolation

**What This Spec Intends to Create (verify against current implementation):**

- `conversation-files` Supabase Storage bucket (or filesystem equivalent)
- `conversations` PostgreSQL table with metadata
- `conversation_turns` PostgreSQL table with normalized turns
- Conversation service using SAOL at `src/lib/services/*-service.ts`
- Enhanced UI at `/conversations` with filtering and export
- File cleanup mechanism for expired conversations

### Dependencies

**External Dependencies:**
1. **Supabase PostgreSQL**: Database for conversations and turns tables
2. **Supabase Storage** (or filesystem alternative): Object storage for JSON conversation files
3. **SAOL Library**: **ALL database operations use SAOL** (v2 requirement)
4. **Template Execution System**: Generates conversations that this system stores

**Internal Dependencies:**
1. **Template System (E01/E02)**: Provides generated conversations
2. **Type System**: Extended with Conversation/Turn interfaces
3. **UI Components**: Existing dashboard page enhanced

**Dependencies from Prior Work:**
- E01/E02 (Scaffolding): Provides the generation system that outputs conversations
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
  - **Consider filesystem storage as alternative** (already implemented in current codebase)

**Risk 2: File Upload/Download Performance**
- **Problem**: Large JSON files (50KB-200KB) may cause slow UI response
- **Mitigation**:
  - Use streaming uploads for files >50KB
  - Implement presigned URLs for downloads (if using Supabase Storage)
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
  - **Use SAOL for atomic database operations** (v2 enhancement)

#### Medium-Risk Areas

**Risk 4: Query Performance on Large Tables**
- **Problem**: Conversations table may grow to 100K+ rows, slowing dashboard queries
- **Mitigation**:
  - Add indexes on frequently filtered columns (status, tier, quality_score, created_at)
  - Use pagination (25 records per page)
  - Implement query result caching (5 minute TTL)
  - Archive old conversations to separate table after 1 year
  - **Use SAOL's agentQuery with indexed columns** (v2 enhancement)

**Risk 5: RLS Policy Complexity**
- **Problem**: Multi-tenant RLS policies may block legitimate operations
- **Mitigation**:
  - Start with simple RLS (user can see own conversations)
  - Add service role bypass for admin operations
  - Test RLS policies with multiple user accounts
  - Document RLS policy logic clearly
  - **Use SAOL's preflight checks to validate RLS** (v2 enhancement)

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Database Foundation & Storage Setup**
- **Why First**: All other components depend on database schema and storage infrastructure
- **Scope**: Create tables using SAOL, setup storage bucket (or filesystem), basic CRUD service
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

## Database Setup Instructions (v2 - Using SAOL)

### IMPORTANT: Use SAOL for All Database Operations

**v2 CHANGE**: This section has been completely rewritten to use the Supabase Agent Ops Library (SAOL) instead of manual SQL execution.

**Why SAOL?**
- ✅ Automatic escaping of special characters (quotes, apostrophes, newlines, emojis)
- ✅ Intelligent error reporting with `nextActions` guidance
- ✅ Preflight validation before operations execute
- ✅ Dry-run mode to test before committing changes
- ✅ Consistent error handling across all operations
- ✅ Safe-by-default with required confirmations for destructive ops

**SAOL Library Location:**
- Path: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- Quick Start: `supa-agent-ops\saol-agent-quick-start-guide_v1.md`
- Full Manual: `supa-agent-ops\saol-agent-manual_v2.md`

### Required Database Operations Using SAOL

**EXECUTE THESE OPERATIONS IN SEQUENCE:**

========================

### Step 1: Verify SAOL Setup

Before creating database objects, verify SAOL is working:

```bash
# Verify SAOL library is available
node -e "const saol=require('./supa-agent-ops');console.log('SAOL loaded:', typeof saol.agentExecuteDDL === 'function');"

# Verify environment variables
node -e "console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING'); console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');"

# Test connection
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentPreflight({table:'personas'});console.log('Connection test:', r.ok ? 'SUCCESS' : 'FAILED');})();"
```

Expected: All checks should pass

### Step 2: Create Database Tables Using SAOL

**NOTE**: If you completed Execution E02 Prompt 1, these tables may already exist. You can skip to Step 3 for verification.

Create the following JavaScript files to use SAOL for table creation:

**File: `src/scripts/saol-create-conversations-table.js`**

```javascript
const saol = require('./supa-agent-ops');

async function createConversationsTable() {
  const ddl = `
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
    CREATE INDEX IF NOT EXISTS idx_conversations_id ON conversations(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
    CREATE INDEX IF NOT EXISTS idx_conversations_tier ON conversations(tier);
    CREATE INDEX IF NOT EXISTS idx_conversations_quality ON conversations(quality_score DESC);
    CREATE INDEX IF NOT EXISTS idx_conversations_persona ON conversations(persona_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_arc ON conversations(emotional_arc_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_topic ON conversations(training_topic_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_created ON conversations(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
    CREATE INDEX IF NOT EXISTS idx_conversations_processing ON conversations(processing_status);

    COMMENT ON TABLE conversations IS 'Metadata for generated LoRA training conversations with file storage references';
    COMMENT ON COLUMN conversations.status IS 'Review workflow: pending_review → approved/rejected → archived';
    COMMENT ON COLUMN conversations.processing_status IS 'Generation workflow: queued → processing → completed/failed';
    COMMENT ON COLUMN conversations.file_url IS 'URL or path to conversation JSON file';
  `;

  console.log('Creating conversations table via SAOL...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun.summary);

  if (!dryRun.success) {
    console.error('Dry run failed. Next actions:', dryRun.nextActions);
    return;
  }

  // Execute for real
  const result = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: false
  });

  console.log('\nExecution result:', result.success ? 'SUCCESS' : 'FAILED');
  console.log('Summary:', result.summary);

  if (!result.success) {
    console.log('Next actions:', result.nextActions);
  }
}

createConversationsTable().catch(console.error);
```

**Execute:**
```bash
node src/scripts/saol-create-conversations-table.js
```

**File: `src/scripts/saol-create-conversation-turns-table.js`**

```javascript
const saol = require('./supa-agent-ops');

async function createConversationTurnsTable() {
  const ddl = `
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

    CREATE INDEX IF NOT EXISTS idx_turns_conversation ON conversation_turns(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_turns_number ON conversation_turns(conversation_id, turn_number);
    CREATE INDEX IF NOT EXISTS idx_turns_role ON conversation_turns(role);

    COMMENT ON TABLE conversation_turns IS 'Normalized storage of individual conversation turns for querying and analysis';
    COMMENT ON COLUMN conversation_turns.content IS 'The actual text content of the turn (user input or assistant response)';
  `;

  console.log('Creating conversation_turns table via SAOL...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun.summary);

  if (!dryRun.success) {
    console.error('Dry run failed. Next actions:', dryRun.nextActions);
    return;
  }

  // Execute for real
  const result = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: false
  });

  console.log('\nExecution result:', result.success ? 'SUCCESS' : 'FAILED');
  console.log('Summary:', result.summary);

  if (!result.success) {
    console.log('Next actions:', result.nextActions);
  }
}

createConversationTurnsTable().catch(console.error);
```

**Execute:**
```bash
node src/scripts/saol-create-conversation-turns-table.js
```

### Step 3: Create RLS Policies Using SAOL

**File: `src/scripts/saol-create-conversation-rls.js`**

```javascript
const saol = require('./supa-agent-ops');

async function createConversationRLS() {
  const ddl = `
    -- Enable RLS on both tables
    ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
    ALTER TABLE conversation_turns ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for conversations table
    CREATE POLICY "Users can view own conversations"
      ON conversations FOR SELECT
      USING (auth.uid() = created_by);

    CREATE POLICY "Users can create own conversations"
      ON conversations FOR INSERT
      WITH CHECK (auth.uid() = created_by);

    CREATE POLICY "Users can update own conversations"
      ON conversations FOR UPDATE
      USING (auth.uid() = created_by);

    CREATE POLICY "Users can delete own conversations"
      ON conversations FOR DELETE
      USING (auth.uid() = created_by);

    -- RLS Policies for conversation_turns table
    CREATE POLICY "Users can view own conversation turns"
      ON conversation_turns FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = conversation_turns.conversation_id
          AND conversations.created_by = auth.uid()
        )
      );

    CREATE POLICY "Users can create own conversation turns"
      ON conversation_turns FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM conversations
          WHERE conversations.id = conversation_turns.conversation_id
          AND conversations.created_by = auth.uid()
        )
      );
  `;

  console.log('Creating RLS policies via SAOL...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun.summary);

  if (!dryRun.success) {
    console.error('Dry run failed. Next actions:', dryRun.nextActions);
    return;
  }

  // Execute for real
  const result = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: false
  });

  console.log('\nExecution result:', result.success ? 'SUCCESS' : 'FAILED');
  console.log('Summary:', result.summary);

  if (!result.success) {
    console.log('Next actions:', result.nextActions);
  }
}

createConversationRLS().catch(console.error);
```

**Execute:**
```bash
node src/scripts/saol-create-conversation-rls.js
```

### Step 4: Verify Database Setup Using SAOL

**File: `src/scripts/saol-verify-conversation-setup.js`**

```javascript
const saol = require('./supa-agent-ops');

async function verifyConversationSetup() {
  console.log('='.repeat(60));
  console.log('CONVERSATION STORAGE DATABASE VERIFICATION');
  console.log('='.repeat(60));
  console.log();

  // Check conversations table exists
  console.log('1. TABLE EXISTENCE CHECK:');
  const tables = ['conversations', 'conversation_turns'];
  for (const table of tables) {
    const result = await saol.agentQuery({ table, limit: 0 });
    console.log(`   ${table}: ${result.success ? '✓ EXISTS' : '✗ MISSING'}`);
  }
  console.log();

  // Check row counts
  console.log('2. ROW COUNT CHECK:');
  for (const table of tables) {
    const result = await saol.agentCount({ table });
    console.log(`   ${table}: ${result.count} rows`);
  }
  console.log();

  // Check schema
  console.log('3. SCHEMA VERIFICATION:');
  const schema = await saol.agentIntrospectSchema({
    table: 'conversations',
    includeColumns: true,
    includeIndexes: true,
    transport: 'pg'
  });

  console.log(`   Conversations table has ${schema.tables[0].columns.length} columns`);
  console.log(`   Indexes: ${schema.tables[0].indexes?.length || 0}`);
  console.log();

  // Verify foreign keys exist
  console.log('4. FOREIGN KEY CHECK:');
  const fkColumns = ['persona_id', 'emotional_arc_id', 'training_topic_id', 'template_id'];
  for (const col of fkColumns) {
    const exists = schema.tables[0].columns.some(c => c.name === col);
    console.log(`   ${col}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
  }
  console.log();

  console.log('='.repeat(60));
  console.log('VERIFICATION COMPLETE');
  console.log('='.repeat(60));
}

verifyConversationSetup().catch(console.error);
```

**Execute:**
```bash
node src/scripts/saol-verify-conversation-setup.js
```

Expected output:
```
============================================================
CONVERSATION STORAGE DATABASE VERIFICATION
============================================================

1. TABLE EXISTENCE CHECK:
   conversations: ✓ EXISTS
   conversation_turns: ✓ EXISTS

2. ROW COUNT CHECK:
   conversations: 0 rows
   conversation_turns: 0 rows

3. SCHEMA VERIFICATION:
   Conversations table has 35 columns
   Indexes: 10

4. FOREIGN KEY CHECK:
   persona_id: ✓ EXISTS
   emotional_arc_id: ✓ EXISTS
   training_topic_id: ✓ EXISTS
   template_id: ✓ EXISTS

============================================================
VERIFICATION COMPLETE
============================================================
```

### Step 5: (Optional) Create Supabase Storage Bucket

**NOTE**: The current implementation may use filesystem storage instead. This step is OPTIONAL.

If using Supabase Storage, create bucket manually in Supabase Dashboard:

1. Navigate to Storage in Supabase Dashboard
2. Create new bucket: `conversation-files`
3. Settings:
   - Public: false (requires authentication)
   - File size limit: 10MB
   - Allowed MIME types: application/json
4. Create RLS policies in Storage → Policies:
   - "Users can upload to own folder" (INSERT): `bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text`
   - "Users can read from own folder" (SELECT): `bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text`
   - "Users can update own files" (UPDATE): `bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text`
   - "Users can delete own files" (DELETE): `bucket_id = 'conversation-files' AND (storage.foldername(name))[1] = auth.uid()::text`

**Alternative**: Use filesystem storage as implemented in `src/lib/backup/storage.ts`

++++++++++++++++++

---

## Implementation Prompts

**(The following prompts are unchanged from v1, but now assume SAOL is used for all database operations)**

### Prompt 1: Database Foundation & Storage Service Core

**Scope**: Verify tables created via SAOL, implement conversation storage service CRUD operations
**Dependencies**: Tables created via SAOL (steps above), SAOL library
**Estimated Time**: 12-15 hours
**Risk Level**: Low-Medium

========================

You are a senior backend developer implementing the Conversation Storage Service Foundation for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Conversation Storage Service manages the complete lifecycle of generated training conversations: file storage (Supabase Storage or filesystem), metadata persistence in PostgreSQL via SAOL, and workflow management (review, approval, export). This prompt establishes the core CRUD service layer.

**Storage Architecture:**
- **Files**: Conversation JSON files stored in Supabase Storage bucket `conversation-files` OR filesystem via `src/lib/backup/storage.ts`
- **Metadata**: Conversation metadata in `conversations` PostgreSQL table
- **Turns**: Individual conversation turns in `conversation_turns` table for querying
- **Dual-Write**: File upload + metadata insert must be atomic (transactional)

**File Organization (if using Supabase Storage):**
```
conversation-files/
  {user_id}/
    {conversation_id}/
      conversation.json
      metadata.json (optional)
```

**CURRENT CODEBASE STATE:**

**Database Schema** (Already Created via SAOL):
- `conversations` table with fields: id, conversation_id, persona_id, emotional_arc_id, quality_score, status, file_url, etc.
- `conversation_turns` table with fields: id, conversation_id, turn_number, role, content, detected_emotion, etc.
- Storage bucket `conversation-files` created with RLS policies (or filesystem storage)

**VERIFY CURRENT IMPLEMENTATION FIRST:**
Check if `conversation-service.ts` or `conversation-storage-service.ts` already exists. If it exists, review and enhance it instead of creating from scratch.

**SAOL Library Usage** (Required):
- **Library Location**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- **Quick Start**: `supa-agent-ops\saol-agent-quick-start-guide_v1.md`
- **Key Functions**:
  - `agentImportTool({ source, table, mode, onConflict })` - Insert/update data
  - `agentQuery({ table, where, limit, orderBy })` - Query data
  - `agentCount({ table, where })` - Count records
  - `agentDelete({ table, where, confirm })` - Delete records

**Supabase Storage Client** (for file operations if not using filesystem):
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

Refer to the v1 specification for complete implementation details for:
- Task T-1.1: Create Type Definitions (if not already existing)
- Task T-1.2: Create Conversation Storage Service (or enhance existing conversation-service.ts)

**KEY CHANGES FOR V2:**
- All database operations MUST use SAOL
- Verify existing services before creating new ones
- File storage may use filesystem instead of Supabase Storage
- Follow existing codebase patterns for service structure

[Rest of Prompt 1 content from v1 applies with SAOL usage]

++++++++++++++++++

---

### Prompt 2: File Upload/Download & Metadata Extraction

**Scope**: Enhance storage service with batch operations, metadata extraction refinement, file validation
**Dependencies**: Storage service core (Prompt 1), conversation JSON schema
**Estimated Time**: 10-12 hours
**Risk Level**: Medium

========================

[Prompt 2 content from v1 applies, with note to use SAOL for all database operations]

++++++++++++++++++

---

### Prompt 3: UI Integration & Conversation Management Dashboard

**Scope**: Enhance /conversations page with filtering, status management, export, file viewing
**Dependencies**: Storage service complete, conversation API endpoints
**Estimated Time**: 13-18 hours
**Risk Level**: Medium

========================

[Prompt 3 content from v1 applies unchanged]

++++++++++++++++++

---

## Success Criteria

**Conversation Storage System Complete When:**

1. ✅ Database tables created via SAOL
   - conversations table with all metadata fields
   - conversation_turns table for normalized storage
   - All tables created using SAOL (not manual SQL)

2. ✅ Storage service operational
   - File upload/download works reliably (Supabase Storage or filesystem)
   - Metadata extraction captures all quality scores
   - Batch operations handle partial failures
   - All database operations use SAOL

3. ✅ UI integration complete
   - /conversations page displays conversations
   - Filtering and pagination functional
   - Status management (approve/reject) works
   - File viewing available

4. ✅ Quality validation
   - All conversations have valid file_url or file_path
   - Metadata accurately reflects file content
   - No orphaned files or metadata

5. ✅ Performance acceptable
   - Dashboard loads in <2s for 1000 conversations
   - File uploads complete in <5s for 200KB files
   - Database queries use indexed columns

---

**Document Status:** Implementation specification ready for execution
**Version:** v2
**Total Prompts:** 3
**Sequential Execution Recommended:** Yes
**Estimated Total Time:** 35-50 hours

**Key Changes from v1:**
- Database setup now uses SAOL instead of manual SQL
- Added verification that existing services may already implement this functionality
- Clarified that Supabase Storage is optional (filesystem alternative available)
- All database operations must use SAOL library
