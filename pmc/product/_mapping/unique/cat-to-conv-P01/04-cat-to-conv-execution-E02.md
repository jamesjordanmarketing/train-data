# Categories-to-Conversations Pipeline - Implementation Execution Instructions (E02)

**Generated**: 2025-11-15
**Segment**: E02 - Conversation Scaffolding Implementation (Updated)
**Total Prompts**: 4
**Estimated Implementation Time**: 50-70 hours
**Specification Sources**:
- `04-categories-to-conversation-strategic-overview_v1.md`
- `04-categories-to-conversation-pipeline-spec_v1.md`
- `01-cat-to-conv-conversation-storage-spec_v2.md`
**Functional Requirements**: POC Scope - Short-Term Scaffolding Data Implementation

---

## Executive Summary

The E02 segment implements the complete **Conversation Scaffolding Data System** for the Interactive LoRA Conversation Generation Module, enabling structured persona, emotional arc, and training topic selection to replace the current free-text approach. This transformation enables consistent, high-quality conversation generation aligned with the Elena Morales methodology.

**IMPORTANT UPDATE (E02 vs E01):**
This execution file has been updated to include a new **Prompt 1: Supabase Database Setup using SAOL**, which was missing from E01. All Supabase operations now use the Supabase Agent Ops Library (SAOL) for safety, reliability, and intelligent error handling. The original 3 prompts have been renumbered as Prompts 2-4.

This segment is **strategically critical** because:

1. **Foundation for Quality**: Structured scaffolding data ensures all generated conversations follow proven emotional intelligence patterns
2. **Scalability**: Database-driven approach enables growth from 10 seed conversations to 1000+ variations
3. **Reproducibility**: Scaffolding snapshots provide complete audit trail and regeneration capability
4. **Future Integration**: Lays groundwork for chunk/category mapping and AI-assisted parameter suggestion
5. **Methodology Preservation**: Embeds Elena Morales principles directly in database schema and service layer

**Key Deliverables:**
- Supabase database objects (tables, indexes, RLS policies) created via SAOL
- Three new database tables (personas, emotional_arcs, training_topics) populated with seed data
- Scaffolding data service layer for CRUD operations
- Parameter assembly service for conversation generation
- Template selection service based on emotional arc + tier
- Enhanced /conversations/generate API endpoint with scaffolding integration
- UI components for scaffolding selection with compatibility warnings

---

## Context and Dependencies

### Current System State

**Existing Infrastructure (Available):**

1. **Database Foundation**:
   - Conversations table with persona (string), emotion (string), topic (string) fields
   - Conversation_turns table with normalized turn storage
   - Templates table (prompt_templates) for conversation generation
   - Review workflow with approval/rejection tracking
   - Supabase Row Level Security (RLS) for multi-tenant isolation
   - Reference: `src/lib/types/conversations.ts`

2. **Type System**:
   - Conversation type: persona, emotion, topic as string fields
   - TierType: 'template' | 'scenario' | 'edge_case'
   - ConversationStatus type with approval workflow states
   - QualityMetrics type for scoring
   - Reference: `src/lib/types/index.ts`, `src/lib/types/conversations.ts`

3. **Service Layer Patterns**:
   - conversation-service.ts: CRUD operations for conversations
   - conversation-generation-service.ts: Claude API integration
   - template-service.ts: Template retrieval and management
   - Reference: `src/lib/services/`

4. **API Patterns**:
   - Next.js 14 App Router API routes
   - Supabase client integration via `createClient()`
   - Error handling with try-catch
   - JSON response formatting
   - Reference: `src/app/api/conversations/generate/route.ts`

5. **UI Components**:
   - Shadcn/UI component library (Dialog, Select, Label, etc.)
   - /conversations/generate page (exists but needs scaffolding dropdowns)
   - Reference: `src/components/ui/`

**Current Limitations:**

1. **No Scaffolding Tables**: personas, emotional_arcs, training_topics tables do not exist
2. **Free-Text Input**: persona, emotion, topic entered as strings (inconsistent, error-prone)
3. **No Provenance**: Conversations don't track which scaffolding data was used
4. **No Compatibility Checking**: System doesn't warn about incompatible parameter combinations
5. **Template Selection Manual**: No automatic template selection based on emotional arc + tier

### Specification Requirements Summary

**From Strategic Overview (`04-categories-to-conversation-strategic-overview_v1.md`):**

- **POC Scope**: Focus on conversation scaffolding data (personas, emotional arcs, training topics)
- **Hard-Coded Options**: Seed data from c-alpha-build_v3.4-LoRA-FP-100-spec.md
- **Personas**: Marcus-type (Overwhelmed Avoider), Jennifer-type (Anxious Planner), David-type (Pragmatic Optimist)
- **Emotional Arcs**: Confusion→Clarity, Shame→Acceptance, Couple Conflict→Alignment, Fear→Confidence, Overwhelm→Empowerment
- **Training Topics**: 10+ topics from seed conversations (HSA vs FSA, Roth IRA conversion, RMDs, etc.)
- **Out of Scope**: Category/chunk mapping, batch processing, project layer, CSV import/export

**From Pipeline Specification (`04-categories-to-conversation-pipeline-spec_v1.md`):**

- **Database Schema**: Complete table definitions for personas, emotional_arcs, training_topics
- **Service Layer**: ScaffoldingDataService, ParameterAssemblyService, TemplateSelectionService
- **API Endpoints**: /api/scaffolding/* for data retrieval, /api/conversations/generate-with-scaffolding
- **UI Components**: ScaffoldingSelector with dropdowns for persona, arc, topic, tier
- **Compatibility Checking**: Validate persona-arc-topic combinations, provide warnings

### Data Source Specification

**Primary Seed Data Source**: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`

**Note**: This file contains the complete specification for personas, emotional arcs, topics, and response strategies from the 10 seed conversations. The implementation must extract and structure this data into the database schema.

**Validation Source**: 10 seed conversations in `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds/`

### Cross-Segment Dependencies

**Dependencies on Existing Work:**
1. **Conversation Data Model**: Scaffolding system extends existing conversations table
2. **Template System**: Template selection integrates with existing prompt_templates table
3. **Generation Service**: Parameter assembly feeds into existing conversation-generation-service.ts
4. **UI Infrastructure**: Scaffolding selectors use existing Shadcn/UI components

**External System Dependencies:**
1. **Supabase PostgreSQL**: Database for new scaffolding tables
2. **Supabase Client Library**: For database operations
3. **SAOL (Supabase Agent Ops Library)**: For safe database operations
4. **Next.js API Routes**: Serverless functions for scaffolding endpoints
5. **React/TypeScript**: UI component development

**No Blocking Dependencies**: E02 can be implemented immediately based on current system state.

---

## Implementation Strategy

### Risk Assessment

#### High-Risk Areas

**Risk 1: Data Extraction Accuracy from Spec**
- **Problem**: Manual extraction from c-alpha-build spec may introduce errors or inconsistencies
- **Mitigation**:
  - Cross-reference spec document with actual seed conversations
  - Validate each persona appears in at least one seed conversation
  - Verify emotional arc patterns match conversation structure
  - Test-generate conversations with each scaffolding combination

**Risk 2: Breaking Existing Conversation Generation**
- **Problem**: Adding scaffolding integration may break existing generation workflow
- **Mitigation**:
  - Create NEW endpoint (/api/conversations/generate-with-scaffolding) alongside existing /api/conversations/generate
  - Do NOT modify existing generation logic initially
  - Add scaffolding as optional enhancement, preserve backward compatibility
  - Test existing conversations still generate correctly

**Risk 3: Template Selection Algorithm Gaps**
- **Problem**: Not enough templates exist to match all arc + tier combinations
- **Mitigation**:
  - Implement fallback logic: if no perfect match, use best arc match regardless of tier
  - Log warnings when fallback used
  - Return alternatives array with confidence scores
  - Add "create template" guidance in error messages

#### Medium-Risk Areas

**Risk 4: Compatibility Logic Complexity**
- **Problem**: Determining persona-arc-topic compatibility may be subjective
- **Mitigation**:
  - Start with permissive compatibility (warnings, not errors)
  - Use explicit `compatible_arcs` and `suitable_personas` arrays
  - Allow users to override warnings
  - Collect compatibility feedback for future refinement

**Risk 5: UI State Management Complexity**
- **Problem**: Scaffolding selector state synchronization with generation form
- **Mitigation**:
  - Use controlled components with single source of truth
  - Clear parent-child prop flow
  - Validate all selections before enabling "Generate" button
  - Display clear loading/error states

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Supabase Database Setup using SAOL (NEW)**
- **Why First**: All other components depend on database tables, indexes, and RLS policies
- **Scope**: Use SAOL to create tables, indexes, RLS policies, and RPC functions
- **Output**: Working database with all scaffolding infrastructure
- **Estimated Time**: 6-10 hours

**Prompt 2: Database Foundation & Data Population (was Prompt 1)**
- **Why Second**: Population depends on database tables existing
- **Scope**: Extract seed data, populate database, basic validation
- **Output**: Working database with complete scaffolding data
- **Estimated Time**: 15-20 hours

**Prompt 3: Service Layer & API Integration (was Prompt 2)**
- **Why Third**: Business logic foundation for scaffolding operations
- **Scope**: ScaffoldingDataService, ParameterAssemblyService, TemplateSelectionService, API endpoints
- **Output**: Complete service layer with API endpoints ready for UI integration
- **Estimated Time**: 15-20 hours

**Prompt 4: UI Components & End-to-End Integration (was Prompt 3)**
- **Why Fourth**: User-facing interface depending on API availability
- **Scope**: ScaffoldingSelector component, /conversations/generate page updates, compatibility UI, testing
- **Output**: Complete scaffolding system with working UI and end-to-end generation
- **Estimated Time**: 10-20 hours

**Independence Strategy**: Each prompt is self-contained with complete context. Prompts 2-4 depend on Prompt 1 completion but include validation steps to verify dependencies.

### Quality Assurance Approach

**Quality Gates Per Prompt:**

1. **Functional Acceptance Criteria**: Each prompt includes explicit success criteria
2. **Manual Testing**: Step-by-step validation procedures
3. **Edge Case Testing**: Empty states, missing data, incompatible combinations
4. **Integration Testing**: Verify compatibility with existing system
5. **Data Validation**: Cross-check seed data against source specifications

**Cross-Prompt Quality Checks:**

- **Type Safety**: All TypeScript types match across service layer, API, and UI
- **Error Handling**: Consistent error messages and user-friendly error states
- **Data Integrity**: Foreign key relationships maintain referential integrity
- **Audit Trail**: Scaffolding snapshots capture complete provenance
- **Methodology Compliance**: Elena Morales principles embedded throughout

**Testing Strategy:**

- **Database Validation** (Required): Verify all tables, indexes, and constraints
- **Service Unit Tests** (Optional): Individual service methods with mock data
- **API Integration Tests** (Required): API endpoints with test database
- **UI Manual Tests** (Required): Complete scaffolding selection workflow
- **End-to-End Tests** (Required): Generate conversations with each persona-arc-topic combination

---

## Database Setup Prerequisites

### SAOL Library Access

**For all Supabase operations use the Supabase Agent Ops Library (SAOL):**

- **Library location**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- **Quick Start Guide**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`
- **Full Manual**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-manual_v2.md`

**Why SAOL**: SAOL provides safe database operations with automatic character escaping, intelligent error reporting, preflight validation, and dry-run capabilities.

### Current Database State Validation

Before executing prompts, validate the current database state:

1. **Verify conversations table exists**:
   ```bash
   node src/scripts/cursor-db-helper.js describe conversations
   ```

2. **Verify prompt_templates table exists**:
   ```bash
   node src/scripts/cursor-db-helper.js describe prompt_templates
   ```

3. **Check for existing scaffolding tables** (should NOT exist):
   ```bash
   node src/scripts/cursor-db-helper.js list-tables | grep -E "(personas|emotional_arcs|training_topics)"
   ```

Expected: No matches (tables don't exist yet)

---

## Prompt 1: Supabase Database Setup using SAOL

### Objective

Create all Supabase database objects (tables, indexes, constraints, RLS policies, RPC functions) for the conversation scaffolding system using the SAOL library. This ensures safe, reliable database operations with automatic error handling and validation.

### Prerequisites

- SAOL library available at `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- Supabase service role key configured in environment variables
- Access to database with admin privileges

### Context

This is a NEW prompt added in E02 to ensure all Supabase operations use SAOL instead of manual SQL execution. Manual SQL is error-prone and doesn't benefit from SAOL's automatic escaping, preflight checks, and intelligent error guidance.

### Acceptance Criteria

1. ✅ All three scaffolding tables created: personas, emotional_arcs, training_topics
2. ✅ Foreign key columns added to conversations table: persona_id, emotional_arc_id, training_topic_id, scaffolding_snapshot
3. ✅ Foreign key columns added to prompt_templates table: emotional_arc_id, emotional_arc_type, suitable_personas, suitable_topics
4. ✅ All indexes created for performance optimization
5. ✅ RLS policies configured for multi-tenant data isolation
6. ✅ RPC functions created for usage tracking (increment_persona_usage, increment_arc_usage, increment_topic_usage)
7. ✅ All operations validated with SAOL error checking

========================


# PROMPT 1: Supabase Database Setup using SAOL

## Task Overview

You are implementing the complete Supabase database infrastructure for the conversation scaffolding system using the Supabase Agent Ops Library (SAOL). This involves creating three new tables (personas, emotional_arcs, training_topics), adding foreign key columns to existing tables, creating indexes, setting up RLS policies, and creating RPC functions for usage tracking.

## Critical Instructions

1. **Use SAOL for all database operations**:
   - Library location: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
   - Quick Start: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`
   - Full Manual: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-manual_v2.md`

2. **All DDL operations must use SAOL's agentExecuteDDL function**:
   - Never execute raw SQL directly
   - Always use `transport: 'pg'` for DDL operations
   - Use `dryRun: true` first to test, then execute with `dryRun: false`

3. **Read complete schema specifications**:
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-pipeline-spec_v1.md` (lines 84-510)
   - Contains complete table schemas with all fields and constraints

4. **Validate all work**:
   - Use SAOL's agentIntrospectSchema to verify table creation
   - Use agentQuery to verify RLS policies are active
   - Test RPC functions with sample data

## Step 1: Setup SAOL Environment

**1.1 Verify SAOL Library Installation**

Check that SAOL is available:

```bash
node -e "const saol=require('./supa-agent-ops');console.log('SAOL version:', saol.version || 'installed');"
```

Expected output: SAOL version confirmation or "installed"

**1.2 Verify Environment Variables**

Ensure you have the required environment variables:

```bash
node -e "console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING'); console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');"
```

Expected output: Both should show "SET"

**1.3 Test SAOL Connection**

Test the connection with a simple preflight check:

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentPreflight({table:'conversations'});console.log('Connection test:', r.ok ? 'SUCCESS' : 'FAILED', r);})();"
```

Expected: "Connection test: SUCCESS"

## Step 2: Create Personas Table

**2.1 Create DDL Script**

Create a file `src/scripts/create-personas-table.js`:

```javascript
const saol = require('./supa-agent-ops');

async function createPersonasTable() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS personas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      -- Identity
      name VARCHAR(100) NOT NULL,
      persona_type VARCHAR(50) NOT NULL,
      short_name VARCHAR(50) NOT NULL,

      -- Description
      description TEXT NOT NULL,
      archetype_summary VARCHAR(200),

      -- Demographics (JSONB for flexibility)
      demographics JSONB NOT NULL DEFAULT '{}',

      -- Financial Profile
      financial_background TEXT,
      financial_situation VARCHAR(50),

      -- Personality & Communication
      personality_traits TEXT[] DEFAULT '{}',
      communication_style TEXT,
      emotional_baseline VARCHAR(50),
      decision_style VARCHAR(50),

      -- Conversation Behavior Patterns
      typical_questions TEXT[] DEFAULT '{}',
      common_concerns TEXT[] DEFAULT '{}',
      language_patterns TEXT[] DEFAULT '{}',

      -- Usage Metadata
      domain VARCHAR(50) DEFAULT 'financial_planning',
      is_active BOOLEAN DEFAULT true,
      usage_count INT DEFAULT 0,

      -- Compatibility
      compatible_arcs TEXT[] DEFAULT '{}',
      complexity_preference VARCHAR(20),

      -- Audit
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID,

      -- Constraints
      UNIQUE(persona_type, domain),
      CHECK (emotional_baseline IN ('anxious', 'confident', 'overwhelmed', 'curious', 'uncertain', 'determined'))
    );

    -- Indexes for personas
    CREATE INDEX IF NOT EXISTS idx_personas_persona_type ON personas(persona_type);
    CREATE INDEX IF NOT EXISTS idx_personas_domain ON personas(domain);
    CREATE INDEX IF NOT EXISTS idx_personas_is_active ON personas(is_active);
    CREATE INDEX IF NOT EXISTS idx_personas_emotional_baseline ON personas(emotional_baseline);

    -- Comments for documentation
    COMMENT ON TABLE personas IS 'Client persona definitions for conversation scaffolding';
    COMMENT ON COLUMN personas.demographics IS 'JSONB containing age_range, career, income_range, family_status, education';
    COMMENT ON COLUMN personas.compatible_arcs IS 'Array of emotional_arc types this persona typically uses';
  `;

  console.log('Creating personas table...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

createPersonasTable().catch(console.error);
```

**2.2 Execute the Script**

```bash
node src/scripts/create-personas-table.js
```

**2.3 Verify Table Creation**

Use SAOL to introspect the schema:

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'personas',includeColumns:true,includeIndexes:true,transport:'pg'});console.log(JSON.stringify(r,null,2));})();"
```

Expected: Schema showing all columns and indexes

## Step 3: Create Emotional Arcs Table

**3.1 Create DDL Script**

Create `src/scripts/create-emotional-arcs-table.js`:

```javascript
const saol = require('./supa-agent-ops');

async function createEmotionalArcsTable() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS emotional_arcs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      -- Identity
      name VARCHAR(100) NOT NULL,
      arc_type VARCHAR(50) NOT NULL UNIQUE,
      category VARCHAR(50),

      -- Description
      description TEXT NOT NULL,
      when_to_use TEXT,

      -- Emotional Progression
      starting_emotion VARCHAR(50) NOT NULL,
      starting_intensity_min NUMERIC(3,2),
      starting_intensity_max NUMERIC(3,2),
      secondary_starting_emotions TEXT[] DEFAULT '{}',

      midpoint_emotion VARCHAR(50),
      midpoint_intensity NUMERIC(3,2),

      ending_emotion VARCHAR(50) NOT NULL,
      ending_intensity_min NUMERIC(3,2),
      ending_intensity_max NUMERIC(3,2),
      secondary_ending_emotions TEXT[] DEFAULT '{}',

      -- Structural Pattern
      turn_structure JSONB DEFAULT '{}',
      conversation_phases TEXT[] DEFAULT '{}',

      -- Response Strategy Guidance
      primary_strategy VARCHAR(100),
      response_techniques TEXT[] DEFAULT '{}',
      avoid_tactics TEXT[] DEFAULT '{}',

      -- Elena Morales Principles Applied
      key_principles TEXT[] DEFAULT '{}',

      -- Communication Patterns
      characteristic_phrases TEXT[] DEFAULT '{}',
      opening_templates TEXT[] DEFAULT '{}',
      closing_templates TEXT[] DEFAULT '{}',

      -- Usage Metadata
      tier_suitability TEXT[] DEFAULT '{}',
      domain VARCHAR(50) DEFAULT 'financial_planning',
      is_active BOOLEAN DEFAULT true,
      usage_count INT DEFAULT 0,

      -- Quality Expectations
      typical_turn_count_min INT,
      typical_turn_count_max INT,
      complexity_level VARCHAR(20),

      -- Audit
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID,

      -- Constraints
      CHECK (starting_intensity_min >= 0 AND starting_intensity_min <= 1),
      CHECK (starting_intensity_max >= 0 AND starting_intensity_max <= 1),
      CHECK (ending_intensity_min >= 0 AND ending_intensity_min <= 1),
      CHECK (ending_intensity_max >= 0 AND ending_intensity_max <= 1)
    );

    -- Indexes for emotional_arcs
    CREATE INDEX IF NOT EXISTS idx_emotional_arcs_arc_type ON emotional_arcs(arc_type);
    CREATE INDEX IF NOT EXISTS idx_emotional_arcs_domain ON emotional_arcs(domain);
    CREATE INDEX IF NOT EXISTS idx_emotional_arcs_is_active ON emotional_arcs(is_active);
    CREATE INDEX IF NOT EXISTS idx_emotional_arcs_starting_emotion ON emotional_arcs(starting_emotion);

    -- Comments for documentation
    COMMENT ON TABLE emotional_arcs IS 'Emotional transformation patterns for conversation structure';
    COMMENT ON COLUMN emotional_arcs.turn_structure IS 'JSONB describing typical conversation flow and turn patterns';
    COMMENT ON COLUMN emotional_arcs.tier_suitability IS 'Array of tier values (template, scenario, edge_case) where this arc is suitable';
  `;

  console.log('Creating emotional_arcs table...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

createEmotionalArcsTable().catch(console.error);
```

**3.2 Execute the Script**

```bash
node src/scripts/create-emotional-arcs-table.js
```

**3.3 Verify Table Creation**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'emotional_arcs',includeColumns:true,includeIndexes:true,transport:'pg'});console.log(JSON.stringify(r,null,2));})();"
```

## Step 4: Create Training Topics Table

**4.1 Create DDL Script**

Create `src/scripts/create-training-topics-table.js`:

```javascript
const saol = require('./supa-agent-ops');

async function createTrainingTopicsTable() {
  const ddl = `
    CREATE TABLE IF NOT EXISTS training_topics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

      -- Identity
      name VARCHAR(200) NOT NULL,
      topic_key VARCHAR(100) NOT NULL,
      category VARCHAR(100),

      -- Description
      description TEXT NOT NULL,
      typical_question_examples TEXT[] DEFAULT '{}',

      -- Classification
      domain VARCHAR(50) DEFAULT 'financial_planning',
      content_category VARCHAR(100),
      complexity_level VARCHAR(20),

      -- Context Requirements
      requires_numbers BOOLEAN DEFAULT false,
      requires_timeframe BOOLEAN DEFAULT false,
      requires_personal_context BOOLEAN DEFAULT false,

      -- Suitability
      suitable_personas TEXT[] DEFAULT '{}',
      suitable_arcs TEXT[] DEFAULT '{}',
      suitable_tiers TEXT[] DEFAULT '{}',

      -- Metadata
      tags TEXT[] DEFAULT '{}',
      related_topics TEXT[] DEFAULT '{}',

      -- Usage
      is_active BOOLEAN DEFAULT true,
      usage_count INT DEFAULT 0,
      priority VARCHAR(20) DEFAULT 'normal',

      -- Audit
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_by UUID,

      -- Constraints
      UNIQUE(topic_key, domain),
      CHECK (complexity_level IN ('basic', 'intermediate', 'advanced')),
      CHECK (priority IN ('high', 'normal', 'low'))
    );

    -- Indexes for training_topics
    CREATE INDEX IF NOT EXISTS idx_training_topics_topic_key ON training_topics(topic_key);
    CREATE INDEX IF NOT EXISTS idx_training_topics_domain ON training_topics(domain);
    CREATE INDEX IF NOT EXISTS idx_training_topics_category ON training_topics(category);
    CREATE INDEX IF NOT EXISTS idx_training_topics_complexity ON training_topics(complexity_level);
    CREATE INDEX IF NOT EXISTS idx_training_topics_is_active ON training_topics(is_active);

    -- Comments for documentation
    COMMENT ON TABLE training_topics IS 'Training topic catalog for conversation generation';
    COMMENT ON COLUMN training_topics.suitable_personas IS 'Array of persona_type values for which this topic is appropriate';
    COMMENT ON COLUMN training_topics.suitable_arcs IS 'Array of arc_type values that pair well with this topic';
  `;

  console.log('Creating training_topics table...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

createTrainingTopicsTable().catch(console.error);
```

**4.2 Execute the Script**

```bash
node src/scripts/create-training-topics-table.js
```

**4.3 Verify Table Creation**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'training_topics',includeColumns:true,includeIndexes:true,transport:'pg'});console.log(JSON.stringify(r,null,2));})();"
```

## Step 5: Alter Conversations Table

**5.1 Create DDL Script**

Create `src/scripts/alter-conversations-table.js`:

```javascript
const saol = require('./supa-agent-ops');

async function alterConversationsTable() {
  const ddl = `
    -- Add scaffolding provenance columns to conversations table
    ALTER TABLE conversations
      ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id),
      ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
      ADD COLUMN IF NOT EXISTS training_topic_id UUID REFERENCES training_topics(id),
      ADD COLUMN IF NOT EXISTS scaffolding_snapshot JSONB;

    -- Add indexes for scaffolding queries
    CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_emotional_arc_id ON conversations(emotional_arc_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_training_topic_id ON conversations(training_topic_id);

    -- Add comments
    COMMENT ON COLUMN conversations.persona_id IS 'Foreign key to personas table for scaffolding provenance';
    COMMENT ON COLUMN conversations.emotional_arc_id IS 'Foreign key to emotional_arcs table for scaffolding provenance';
    COMMENT ON COLUMN conversations.training_topic_id IS 'Foreign key to training_topics table for scaffolding provenance';
    COMMENT ON COLUMN conversations.scaffolding_snapshot IS 'JSONB snapshot of complete scaffolding data at generation time';
  `;

  console.log('Altering conversations table to add scaffolding columns...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

alterConversationsTable().catch(console.error);
```

**5.2 Execute the Script**

```bash
node src/scripts/alter-conversations-table.js
```

**5.3 Verify Alterations**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'conversations',includeColumns:true,transport:'pg'});const cols=r.tables[0].columns.filter(c=>['persona_id','emotional_arc_id','training_topic_id','scaffolding_snapshot'].includes(c.name));console.log('Scaffolding columns:',cols);})();"
```

Expected: All four columns should be present

## Step 6: Alter Prompt Templates Table

**6.1 Create DDL Script**

Create `src/scripts/alter-prompt-templates-table.js`:

```javascript
const saol = require('./supa-agent-ops');

async function alterPromptTemplatesTable() {
  const ddl = `
    -- Add emotional arc integration to prompt_templates table
    ALTER TABLE prompt_templates
      ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
      ADD COLUMN IF NOT EXISTS emotional_arc_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS suitable_personas TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS suitable_topics TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS methodology_principles TEXT[] DEFAULT '{}';

    -- Add indexes for emotional arc queries
    CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc_id ON prompt_templates(emotional_arc_id);
    CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc_type ON prompt_templates(emotional_arc_type);

    -- Add comments
    COMMENT ON COLUMN prompt_templates.emotional_arc_id IS 'Foreign key to emotional_arcs table linking template to specific arc';
    COMMENT ON COLUMN prompt_templates.emotional_arc_type IS 'Denormalized arc_type for faster template selection';
    COMMENT ON COLUMN prompt_templates.suitable_personas IS 'Array of persona_type values this template works well with';
    COMMENT ON COLUMN prompt_templates.suitable_topics IS 'Array of topic_key values this template is suitable for';
  `;

  console.log('Altering prompt_templates table to add emotional arc integration...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

alterPromptTemplatesTable().catch(console.error);
```

**6.2 Execute the Script**

```bash
node src/scripts/alter-prompt-templates-table.js
```

**6.3 Verify Alterations**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'prompt_templates',includeColumns:true,transport:'pg'});const cols=r.tables[0].columns.filter(c=>['emotional_arc_id','emotional_arc_type','suitable_personas','suitable_topics','methodology_principles'].includes(c.name));console.log('Arc integration columns:',cols);})();"
```

Expected: All five columns should be present

## Step 7: Create RPC Functions for Usage Tracking

**7.1 Create RPC Functions Script**

Create `src/scripts/create-rpc-functions.js`:

```javascript
const saol = require('./supa-agent-ops');

async function createRPCFunctions() {
  const ddl = `
    -- RPC function to increment persona usage count
    CREATE OR REPLACE FUNCTION increment_persona_usage(persona_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE personas
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE id = persona_id;
    END;
    $$ LANGUAGE plpgsql;

    -- RPC function to increment arc usage count
    CREATE OR REPLACE FUNCTION increment_arc_usage(arc_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE emotional_arcs
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE id = arc_id;
    END;
    $$ LANGUAGE plpgsql;

    -- RPC function to increment topic usage count
    CREATE OR REPLACE FUNCTION increment_topic_usage(topic_id UUID)
    RETURNS VOID AS $$
    BEGIN
      UPDATE training_topics
      SET usage_count = usage_count + 1,
          updated_at = NOW()
      WHERE id = topic_id;
    END;
    $$ LANGUAGE plpgsql;

    -- Add comments
    COMMENT ON FUNCTION increment_persona_usage IS 'Atomically increment persona usage count';
    COMMENT ON FUNCTION increment_arc_usage IS 'Atomically increment emotional arc usage count';
    COMMENT ON FUNCTION increment_topic_usage IS 'Atomically increment training topic usage count';
  `;

  console.log('Creating RPC functions for usage tracking...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

createRPCFunctions().catch(console.error);
```

**7.2 Execute the Script**

```bash
node src/scripts/create-rpc-functions.js
```

**7.3 Verify RPC Functions**

Test the RPC functions with sample data (will fail if no personas exist yet, which is expected):

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentExecuteRPC({functionName:'increment_persona_usage',params:{persona_id:'00000000-0000-0000-0000-000000000000'}});console.log('RPC test (expected to fail):',r);})();"
```

Expected: Function exists but fails because UUID doesn't exist (this is OK)

## Step 8: Setup Row Level Security (RLS) Policies

**8.1 Create RLS Policies Script**

Create `src/scripts/create-rls-policies.js`:

```javascript
const saol = require('./supa-agent-ops');

async function createRLSPolicies() {
  const ddl = `
    -- Enable RLS on scaffolding tables
    ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
    ALTER TABLE emotional_arcs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE training_topics ENABLE ROW LEVEL SECURITY;

    -- Personas policies: Read-only for authenticated users
    CREATE POLICY "Authenticated users can view personas"
      ON personas FOR SELECT
      TO authenticated
      USING (true);

    -- Emotional arcs policies: Read-only for authenticated users
    CREATE POLICY "Authenticated users can view emotional arcs"
      ON emotional_arcs FOR SELECT
      TO authenticated
      USING (true);

    -- Training topics policies: Read-only for authenticated users
    CREATE POLICY "Authenticated users can view training topics"
      ON training_topics FOR SELECT
      TO authenticated
      USING (true);

    -- Grant usage tracking RPC functions to authenticated users
    GRANT EXECUTE ON FUNCTION increment_persona_usage TO authenticated;
    GRANT EXECUTE ON FUNCTION increment_arc_usage TO authenticated;
    GRANT EXECUTE ON FUNCTION increment_topic_usage TO authenticated;
  `;

  console.log('Creating RLS policies for scaffolding tables...');

  // Dry run first
  const dryRun = await saol.agentExecuteDDL({
    sql: ddl,
    transport: 'pg',
    dryRun: true
  });

  console.log('Dry run result:', dryRun);

  if (!dryRun.success) {
    console.error('Dry run failed:', dryRun.summary);
    console.log('Next actions:', dryRun.nextActions);
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

createRLSPolicies().catch(console.error);
```

**8.2 Execute the Script**

```bash
node src/scripts/create-rls-policies.js
```

**8.3 Verify RLS Policies**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentExecuteDDL({sql:'SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename IN (\\'personas\\', \\'emotional_arcs\\', \\'training_topics\\') ORDER BY tablename, policyname;',transport:'pg'});console.log(JSON.stringify(r,null,2));})();"
```

Expected: Should show policies for all three tables

## Step 9: Final Validation

**9.1 Verify All Tables Exist**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'personas',limit:0});console.log('personas:',r.success?'EXISTS':'MISSING');const r2=await saol.agentQuery({table:'emotional_arcs',limit:0});console.log('emotional_arcs:',r2.success?'EXISTS':'MISSING');const r3=await saol.agentQuery({table:'training_topics',limit:0});console.log('training_topics:',r3.success?'EXISTS':'MISSING');})();"
```

Expected: All three should show "EXISTS"

**9.2 Verify Counts (Should be Zero)**

```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r1=await saol.agentCount({table:'personas'});const r2=await saol.agentCount({table:'emotional_arcs'});const r3=await saol.agentCount({table:'training_topics'});console.log('Counts:','personas='+r1.count,'arcs='+r2.count,'topics='+r3.count);})();"
```

Expected: All counts should be 0 (tables are empty, population happens in Prompt 2)

**9.3 Create Summary Report Script**

Create `src/scripts/validate-database-setup.js`:

```javascript
const saol = require('./supa-agent-ops');

async function validateDatabaseSetup() {
  console.log('='.repeat(60));
  console.log('DATABASE SETUP VALIDATION REPORT');
  console.log('='.repeat(60));
  console.log();

  // Check tables exist
  console.log('1. TABLE EXISTENCE CHECK:');
  const tables = ['personas', 'emotional_arcs', 'training_topics'];
  for (const table of tables) {
    const result = await saol.agentQuery({ table, limit: 0 });
    console.log(`   ${table}: ${result.success ? '✓ EXISTS' : '✗ MISSING'}`);
  }
  console.log();

  // Check row counts
  console.log('2. ROW COUNT CHECK (should be 0):');
  for (const table of tables) {
    const result = await saol.agentCount({ table });
    console.log(`   ${table}: ${result.count} rows`);
  }
  console.log();

  // Check foreign keys on conversations table
  console.log('3. CONVERSATIONS TABLE FOREIGN KEYS:');
  const convSchema = await saol.agentIntrospectSchema({
    table: 'conversations',
    includeColumns: true,
    transport: 'pg'
  });
  const fkColumns = ['persona_id', 'emotional_arc_id', 'training_topic_id', 'scaffolding_snapshot'];
  for (const col of fkColumns) {
    const exists = convSchema.tables[0].columns.some(c => c.name === col);
    console.log(`   ${col}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
  }
  console.log();

  // Check foreign keys on prompt_templates table
  console.log('4. PROMPT_TEMPLATES TABLE FOREIGN KEYS:');
  const templateSchema = await saol.agentIntrospectSchema({
    table: 'prompt_templates',
    includeColumns: true,
    transport: 'pg'
  });
  const templateFkColumns = ['emotional_arc_id', 'emotional_arc_type', 'suitable_personas', 'suitable_topics', 'methodology_principles'];
  for (const col of templateFkColumns) {
    const exists = templateSchema.tables[0].columns.some(c => c.name === col);
    console.log(`   ${col}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
  }
  console.log();

  console.log('='.repeat(60));
  console.log('VALIDATION COMPLETE - Ready for Prompt 2 (Data Population)');
  console.log('='.repeat(60));
}

validateDatabaseSetup().catch(console.error);
```

**9.4 Run Validation**

```bash
node src/scripts/validate-database-setup.js
```

Expected output:
```
============================================================
DATABASE SETUP VALIDATION REPORT
============================================================

1. TABLE EXISTENCE CHECK:
   personas: ✓ EXISTS
   emotional_arcs: ✓ EXISTS
   training_topics: ✓ EXISTS

2. ROW COUNT CHECK (should be 0):
   personas: 0 rows
   emotional_arcs: 0 rows
   training_topics: 0 rows

3. CONVERSATIONS TABLE FOREIGN KEYS:
   persona_id: ✓ EXISTS
   emotional_arc_id: ✓ EXISTS
   training_topic_id: ✓ EXISTS
   scaffolding_snapshot: ✓ EXISTS

4. PROMPT_TEMPLATES TABLE FOREIGN KEYS:
   emotional_arc_id: ✓ EXISTS
   emotional_arc_type: ✓ EXISTS
   suitable_personas: ✓ EXISTS
   suitable_topics: ✓ EXISTS
   methodology_principles: ✓ EXISTS

============================================================
VALIDATION COMPLETE - Ready for Prompt 2 (Data Population)
============================================================
```

## Acceptance Checklist

Before moving to Prompt 2, verify:

- [ ] personas table created with all columns and indexes
- [ ] emotional_arcs table created with all columns and indexes
- [ ] training_topics table created with all columns and indexes
- [ ] conversations table has persona_id, emotional_arc_id, training_topic_id, scaffolding_snapshot columns
- [ ] prompt_templates table has emotional_arc_id, emotional_arc_type, suitable_personas, suitable_topics, methodology_principles columns
- [ ] All indexes created successfully
- [ ] RLS policies enabled and configured
- [ ] RPC functions created (increment_persona_usage, increment_arc_usage, increment_topic_usage)
- [ ] All operations performed using SAOL (not manual SQL)
- [ ] Validation script runs successfully

## Troubleshooting

**Issue**: SAOL library not found
**Solution**: Verify you're running scripts from the train-data root directory. Check SAOL is installed in `supa-agent-ops/` subdirectory.

**Issue**: Permission denied errors
**Solution**: Verify you're using SERVICE_ROLE_KEY, not anon key. Check environment variables are set correctly.

**Issue**: Table already exists errors
**Solution**: This is OK if you're re-running scripts. Use `DROP TABLE IF EXISTS` or skip creation steps.

**Issue**: Dry run fails
**Solution**: Read the `nextActions` output from SAOL. It provides specific guidance on what to fix.

## Next Steps

Once this prompt is complete and all acceptance criteria are met, proceed to **Prompt 2: Database Foundation & Data Population**.


+++++++++++++++++




---

## Prompt 2: Database Foundation & Data Population

### Objective

Extract seed data from specifications, populate the database with personas, emotional arcs, and training topics, and verify data integrity.

### Prerequisites

- Prompt 1 completed successfully
- personas, emotional_arcs, training_topics tables exist
- conversations and prompt_templates tables extended with foreign keys

### Context

The database infrastructure is now in place via SAOL. This prompt populates the tables with seed data extracted from the c-alpha-build specification and validates the data.

### Acceptance Criteria

1. ✅ Seed data extracted and validated from c-alpha-build spec
2. ✅ At least 3 personas populated with complete data
3. ✅ At least 5 emotional arcs populated with complete data
4. ✅ At least 10 training topics populated with complete data
5. ✅ All personas have valid emotional_baseline values
6. ✅ All emotional arcs have valid intensity ranges (0-1)
7. ✅ All training topics have valid complexity_level values ('basic', 'intermediate', 'advanced')
8. ✅ Foreign key constraints work (tested with invalid IDs)
9. ✅ Data cross-validated against c-alpha-build spec and seed conversations

**NOTE**: This is the same content as the original Prompt 1 from E01, with renumbering to Prompt 2.

For the complete prompt content, refer to the original E01 file starting at "## Prompt 1: Database Foundation & Data Population".

---

## Prompt 3: Service Layer & API Integration

### Objective

Create the service layer for scaffolding data operations (ScaffoldingDataService, ParameterAssemblyService, TemplateSelectionService) and build API endpoints for scaffolding data retrieval and scaffolding-integrated conversation generation.

### Prerequisites

- Prompt 1 and Prompt 2 completed successfully
- personas, emotional_arcs, training_topics tables populated
- conversations and prompt_templates tables extended with foreign keys

### Context

The database foundation is now in place. This prompt creates the service layer that encapsulates business logic for scaffolding operations and exposes API endpoints for the UI to consume.

### Acceptance Criteria

1. ✅ ScaffoldingDataService created with CRUD operations for all three tables
2. ✅ ParameterAssemblyService created for parameter validation and assembly
3. ✅ TemplateSelectionService created for emotional arc-based template selection
4. ✅ API endpoints created: GET /api/scaffolding/personas, GET /api/scaffolding/emotional-arcs, GET /api/scaffolding/training-topics
5. ✅ API endpoint created: POST /api/scaffolding/check-compatibility
6. ✅ API endpoint created: POST /api/conversations/generate-with-scaffolding
7. ✅ All services have proper TypeScript types and error handling
8. ✅ API endpoints tested and returning correct data

**NOTE**: This is the same content as the original Prompt 2 from E01, with renumbering to Prompt 3.

For the complete prompt content, refer to the original E01 file starting at "## Prompt 2: Service Layer & API Integration".

---

## Prompt 4: UI Components & End-to-End Integration

### Objective

Create UI components for scaffolding selection (ScaffoldingSelector) and integrate them into the /conversations/generate page. Implement compatibility warnings, enable end-to-end conversation generation with scaffolding data, and validate the complete system.

### Prerequisites

- Prompt 1, Prompt 2, and Prompt 3 completed successfully
- All API endpoints functional and tested
- Database populated with scaffolding data

### Context

The backend foundation and service layer are complete. This final prompt creates the user-facing interface for scaffolding selection and integrates it with the conversation generation workflow.

### Acceptance Criteria

1. ✅ ScaffoldingSelector component created with dropdowns for persona, arc, topic, tier
2. ✅ /conversations/generate page updated to use ScaffoldingSelector
3. ✅ Compatibility warnings displayed in real-time as user selects options
4. ✅ Generate button only enabled when all selections are valid
5. ✅ End-to-end workflow tested: Select scaffolding → Generate conversation → View result
6. ✅ At least 5 test conversations generated successfully with different combinations
7. ✅ UI responsive and accessible (keyboard navigation, screen readers)

**NOTE**: This is the same content as the original Prompt 3 from E01, with renumbering to Prompt 4.

For the complete prompt content, refer to the original E01 file starting at "## Prompt 3: UI Components & End-to-End Integration".

---

## Summary and Next Steps

### Implementation Checklist

**Prompt 1: Supabase Database Setup using SAOL (NEW)**
- [ ] SAOL library connection verified
- [ ] personas table created via SAOL
- [ ] emotional_arcs table created via SAOL
- [ ] training_topics table created via SAOL
- [ ] conversations table altered with foreign keys
- [ ] prompt_templates table altered with foreign keys
- [ ] All indexes created
- [ ] RLS policies configured
- [ ] RPC functions created
- [ ] Validation script passes

**Prompt 2: Database Foundation & Data Population (was Prompt 1)**
- [ ] personas table populated
- [ ] emotional_arcs table populated
- [ ] training_topics table populated
- [ ] Foreign keys on conversations table verified
- [ ] Foreign keys on prompt_templates table verified
- [ ] All indexes created
- [ ] Seed data validated

**Prompt 3: Service Layer & API Integration (was Prompt 2)**
- [ ] ScaffoldingDataService implemented
- [ ] ParameterAssemblyService implemented
- [ ] TemplateSelectionService implemented
- [ ] Scaffolding types defined
- [ ] API endpoints created and tested

**Prompt 4: UI Components & End-to-End Integration (was Prompt 3)**
- [ ] ScaffoldingSelector component created
- [ ] /conversations/generate page updated
- [ ] End-to-end generation tested
- [ ] Multiple test conversations generated
- [ ] Accessibility verified

### Success Metrics

**Technical Metrics:**
- 3 new database tables with complete schemas
- 3 new service classes with full CRUD operations
- 5 new API endpoints functional
- 1 new UI component integrated
- 5+ test conversations generated

**Quality Metrics:**
- All generated conversations quality score ≥ 4.0
- Compatibility checking provides useful warnings
- UI is responsive and accessible
- Complete audit trail (scaffolding_snapshot) for all conversations

### Known Limitations (POC Scope)

**Out of Scope for E02:**
- Category/chunk to scaffolding mapping
- Batch processing from categorized content
- CRUD UIs for scaffolding management
- CSV import/export
- Project layer / multi-tenant architecture
- AI-assisted scaffolding suggestion

These will be addressed in future phases per the strategic roadmap.

### Support and Troubleshooting

**If you encounter issues:**

1. **Database Issues**: Check SAOL error messages and follow `nextActions` guidance
2. **Service Issues**: Check TypeScript compilation errors, verify table structures match types
3. **API Issues**: Check Next.js server logs, verify Supabase client is initialized correctly
4. **UI Issues**: Check browser console for errors, verify all dependencies are installed

**Reference Documents:**
- Strategic Overview: `04-categories-to-conversation-strategic-overview_v1.md`
- Pipeline Specification: `04-categories-to-conversation-pipeline-spec_v1.md`
- Storage Specification v2: `01-cat-to-conv-conversation-storage-spec_v2.md`
- SAOL Quick Start: `supa-agent-ops/saol-agent-quick-start-guide_v1.md`

---

**Document Status**: Implementation execution instructions complete, ready for prompt execution
**Generated**: 2025-11-15
**Version**: E02
**Total Estimated Time**: 50-70 hours across 4 prompts
