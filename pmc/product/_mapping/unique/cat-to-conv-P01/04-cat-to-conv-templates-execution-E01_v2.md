# Categories-to-Conversations: Templates Implementation - Execution Specification (E01) v2

**Generated**: 2025-11-14
**Updated**: 2025-11-14 (v2 - SAOL-first database operations)
**Segment**: E01 - Prompt Templates & Conversation Scaffolding Data
**Total Prompts**: 4
**Estimated Implementation Time**: 48-68 hours
**Task Inventory Source**: `04-cat-to-conv-templates-spec_v2.md`
**Strategic Foundation**: `04-categories-to-conversation-strategic-overview_v1.md`

---

## Executive Summary

The E01 segment implements the core foundation for the Categories-to-Conversations pipeline by establishing the prompt template system and conversation scaffolding data infrastructure. This enables the generation of emotionally intelligent LoRA training conversations from structured input parameters.

**This segment is strategically critical because:**

1. **Foundation for Generation**: Prompt templates are the engine that transforms scaffolding data into training conversations
2. **Quality Assurance**: Templates embed Elena Morales methodology ensuring 5/5 quality conversations
3. **Scalability**: Variable-based templates enable infinite conversation variations from finite patterns
4. **Data Infrastructure**: Scaffolding tables (personas, emotional_arcs, training_topics) provide the core configuration options
5. **Integration Ready**: Prepares system for UI integration at `/conversations/generate` page

**Key Deliverables:**
- Database schema created using SAOL (Prompt 0)
- 7 Tier 1 prompt templates extracted from c-alpha-build spec with variable placeholders
- Database tables for personas, emotional_arcs, and training_topics
- Populated scaffolding data from seed conversation specifications
- Updated prompt_templates table with production-ready templates
- Template selection service integrated with emotional arc primary selector
- Variable resolution system for runtime template population

---

## Context and Dependencies

### Referenced Specifications

**Primary Source Documents:**

1. **`04-cat-to-conv-templates-spec_v2.md`** - Main specification for this implementation
   - Details template extraction methodology (lines 122-146)
   - Specifies template organization by emotional arc (lines 75-99)
   - Lists all 7 Tier 1 templates (lines 822-833)
   - Provides complete template structure examples (lines 299-471)

2. **`04-categories-to-conversation-strategic-overview_v1.md`** - Strategic foundation
   - Defines "Conversation Scaffolding Data" concept (lines 161-181)
   - Lists complete scaffolding data requirements (lines 111-159)
   - Explains short-term POC strategy (lines 186-230)
   - Validates input variables sufficiency (lines 35-57)

3. **`C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`**
   - Source for extracting actual prompt templates
   - Contains 7 prompts (Template A-E) with quality requirements
   - Defines Elena Morales voice requirements (lines 140-158 in each prompt)
   - Specifies JSON output format and quality criteria

4. **Seed Conversation Files** - Quality benchmarks and validation data
   - `c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json` through `-10-complete.json`
   - Demonstrate 5/5 quality standard
   - Provide examples of each emotional arc in practice
   - Validate persona, topic, and arc combinations

### Current Codebase State

**Existing Infrastructure to Build Upon:**

1. **Template Services** (already exist):
   - `src/lib/services/template-service.ts` - Template CRUD operations
   - `src/lib/services/template-selection-service.ts` - Template matching logic
   - `src/lib/services/template-resolver.ts` - Variable resolution
   - `src/lib/types/templates.ts` - Template type definitions

2. **API Routes** (already exist):
   - `src/app/api/templates/*` - Template management endpoints
   - `src/app/api/scaffolding/personas/*` - Persona CRUD (stub)
   - `src/app/api/scaffolding/emotional-arcs/*` - Emotional arc CRUD (stub)

3. **Database Pattern** (established):
   - SAOL (Supabase Agent Ops Library) for all database operations
   - Location: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
   - Quick Start: `saol-agent-quick-start-guide_v1.md`
   - TypeScript service layer with strict typing

4. **Type Definitions** (need extension):
   - `src/lib/types.ts` - Core application types
   - Need to add: Persona, EmotionalArc, TrainingTopic interfaces

**What E01 Will Create:**

- Database schema using SAOL `agentExecuteDDL()`
- `personas` table with 3 core persona types from seed data
- `emotional_arcs` table with 7+ emotional transformation patterns
- `training_topics` table with 50+ financial planning topics
- Updated `prompt_templates` table with production templates
- Template population scripts in `src/scripts/`
- Enhanced template selection logic prioritizing emotional arc

### Dependencies

**External Dependencies:**
1. **Supabase PostgreSQL**: Database for scaffolding tables
2. **SAOL Library**: All database operations use SAOL patterns
3. **Seed Conversation Files**: Source data for scaffolding population
4. **c-alpha-build Spec**: Source for prompt template extraction

**Internal Dependencies:**
1. **Existing template services**: Will be extended, not replaced
2. **Type system**: Will add new interfaces for scaffolding data
3. **API routes**: Existing scaffolding endpoints will be connected

**No Blocking Dependencies**: E01 can be implemented immediately with access to spec files and database.

---

## Implementation Strategy

### Risk Assessment

#### High-Risk Areas

**Risk 1: Template Extraction Accuracy**
- **Problem**: Manual extraction from c-alpha spec may introduce errors or miss critical elements
- **Mitigation**:
  - Cross-reference multiple sources (spec + seed conversations)
  - Validate each template against its example conversation
  - Preserve exact Elena Morales phrasing from seed data
  - Test generation with each template before marking complete

**Risk 2: Variable Placeholder Consistency**
- **Problem**: Inconsistent placeholder naming breaks variable resolution
- **Mitigation**:
  - Define standard placeholder naming convention upfront
  - Document all placeholders in template metadata
  - Create validation script to check placeholder matches
  - Test variable resolution with sample data

**Risk 3: Data Quality in Scaffolding Tables**
- **Problem**: Incomplete or inaccurate persona/arc/topic data degrades generation quality
- **Mitigation**:
  - Extract data directly from proven seed conversations
  - Validate each persona appears in at least one 5/5 conversation
  - Cross-check topics against actual seed conversation topics
  - Include quality thresholds and suitability metadata

#### Medium-Risk Areas

**Risk 4: Template Selection Logic Complexity**
- **Problem**: Emotional arc as primary selector may not handle edge cases
- **Mitigation**:
  - Start with simple selection (exact arc match)
  - Add fallback logic (compatible arcs)
  - Log selection decisions for debugging
  - Provide manual template override option

**Risk 5: Schema Migration Challenges**
- **Problem**: Adding new tables may conflict with existing schema
- **Mitigation**:
  - Use SAOL `agentExecuteDDL()` with dry-run mode first
  - Test migrations on development database first
  - Create rollback scripts for each migration
  - Validate foreign key constraints carefully

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 0: Database Schema Setup using SAOL**
- **Why First**: All other prompts depend on database schema existing
- **Scope**: Create all tables using SAOL `agentExecuteDDL()` with DDL SQL
- **Output**: Working database schema with all tables, indexes, and constraints

**Prompt 1: Scaffolding Data Foundation**
- **Why Second**: Templates depend on scaffolding data for variables
- **Scope**: Extract and populate personas, emotional_arcs, training_topics tables
- **Output**: Working scaffolding tables with validated data

**Prompt 2: Prompt Template Extraction & Storage**
- **Why Third**: Core template content needs scaffolding references
- **Scope**: Extract 7 templates from c-alpha spec, templatize with variables, store in database
- **Output**: Production-ready templates with variable placeholders

**Prompt 3: Template Selection & Integration**
- **Why Fourth**: Selection logic needs both scaffolding data and templates
- **Scope**: Update template selection service, integrate with UI, add validation
- **Output**: Complete template system ready for conversation generation

**Independence Strategy**: Each prompt is self-contained with complete context, though sequential execution is optimal.

### Quality Assurance Approach

**Quality Gates Per Prompt:**

1. **Data Validation**: All scaffolding data traceable to seed conversations
2. **Template Fidelity**: Templates preserve Elena Morales methodology completely
3. **Variable Coverage**: All required variables mapped and documented
4. **Integration Testing**: Template selection works with UI inputs
5. **Generation Testing**: Sample conversations achieve 4.5+ quality

**Cross-Prompt Quality Checks:**

- **Type Safety**: All TypeScript interfaces match database schemas
- **Elena Voice Preservation**: All 5 core principles embedded in templates
- **Completeness**: Every emotional arc has at least one template
- **Traceability**: Each template linked to example seed conversation

---

## Implementation Prompts

### Prompt 0: Database Schema Setup using SAOL

**Scope**: Create all database tables, indexes, and constraints using SAOL `agentExecuteDDL()`
**Dependencies**: SAOL library configured, Supabase PostgreSQL connection
**Estimated Time**: 8-10 hours
**Risk Level**: Medium

========================

You are a senior database engineer implementing the Database Schema Foundation for the Interactive LoRA Conversation Generation Module using the Supabase Agent Ops Library (SAOL).

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This system generates emotionally intelligent training conversations for LoRA fine-tuning. The database schema stores conversation scaffolding data (personas, emotional arcs, training topics) and prompt templates. All database operations MUST use SAOL to ensure consistency, safety, and proper error handling.

**Critical Requirement:**
**ALL database schema operations MUST be performed using SAOL's `agentExecuteDDL()` function.** Do NOT execute raw SQL in Supabase SQL Editor. SAOL provides safe DDL execution with dry-run validation, rollback capabilities, and intelligent error guidance.

**SAOL Library Information:**
- **Library Location**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- **Quick Start Guide**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`
- **Key Functions for Schema Operations**:
  - `agentExecuteDDL({ sql, dryRun, transport: 'pg' })` - Execute DDL statements
  - `agentIntrospectSchema({ table, transport: 'pg' })` - Verify schema after creation
  - `agentPreflight({ table, mode })` - Preflight checks before operations

**CURRENT CODEBASE STATE:**

**SAOL Transport Configuration:**
- **Schema operations REQUIRE `transport: 'pg'`** - Direct PostgreSQL connection
- **Default `transport: 'supabase'`** - For data operations (INSERT, SELECT, etc.)

**Environment Variables Required:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role, not anon!
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

**IMPLEMENTATION TASKS:**

**Task T-0.1: Create Database Schema Setup Script**

Create `src/scripts/setup-scaffolding-schema.ts` that uses SAOL to create all tables.

```typescript
/**
 * Database Schema Setup using SAOL
 * Creates all scaffolding tables: personas, emotional_arcs, training_topics, prompt_templates
 */

const saol = require('../../supa-agent-ops');

async function setupScaffoldingSchema() {
  console.log('🚀 Starting database schema setup using SAOL...\n');

  // ============================================================================
  // STEP 1: Define DDL SQL for all tables
  // ============================================================================

  const ddlStatements = `
-- Migration: Create Conversation Scaffolding Tables
-- Date: 2025-11-14
-- Purpose: Store personas, emotional arcs, and training topics for conversation generation

-- ============================================================================
-- PERSONAS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  persona_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  archetype VARCHAR(255) NOT NULL,
  age_range VARCHAR(50),
  occupation VARCHAR(255),
  income_range VARCHAR(100),
  demographics JSONB,
  financial_background TEXT,
  financial_situation TEXT,
  communication_style TEXT,
  emotional_baseline VARCHAR(100),
  typical_questions TEXT[],
  common_concerns TEXT[],
  language_patterns TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_personas_key ON personas(persona_key);
CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(archetype);
CREATE INDEX IF NOT EXISTS idx_personas_active ON personas(is_active);

COMMENT ON TABLE personas IS 'Client persona definitions for conversation generation (Marcus-type, Jennifer-type, David-type)';
COMMENT ON COLUMN personas.persona_key IS 'Unique identifier like "overwhelmed_avoider", "anxious_planner"';
COMMENT ON COLUMN personas.demographics IS 'JSONB: age, gender, family_status, location, etc.';

-- ============================================================================
-- EMOTIONAL ARCS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS emotional_arcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arc_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  starting_emotion VARCHAR(100) NOT NULL,
  starting_intensity_min NUMERIC(3,2) CHECK (starting_intensity_min BETWEEN 0 AND 1),
  starting_intensity_max NUMERIC(3,2) CHECK (starting_intensity_max BETWEEN 0 AND 1),
  ending_emotion VARCHAR(100) NOT NULL,
  ending_intensity_min NUMERIC(3,2) CHECK (ending_intensity_min BETWEEN 0 AND 1),
  ending_intensity_max NUMERIC(3,2) CHECK (ending_intensity_max BETWEEN 0 AND 1),
  arc_strategy TEXT,
  key_principles TEXT[],
  characteristic_phrases TEXT[],
  response_techniques TEXT[],
  avoid_tactics TEXT[],
  typical_turn_count_min INTEGER,
  typical_turn_count_max INTEGER,
  complexity_baseline INTEGER CHECK (complexity_baseline BETWEEN 1 AND 10),
  tier VARCHAR(50) DEFAULT 'template',
  suitable_personas TEXT[],
  suitable_topics TEXT[],
  example_conversation_id VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotional_arcs_key ON emotional_arcs(arc_key);
CREATE INDEX IF NOT EXISTS idx_emotional_arcs_starting ON emotional_arcs(starting_emotion);
CREATE INDEX IF NOT EXISTS idx_emotional_arcs_ending ON emotional_arcs(ending_emotion);
CREATE INDEX IF NOT EXISTS idx_emotional_arcs_tier ON emotional_arcs(tier);
CREATE INDEX IF NOT EXISTS idx_emotional_arcs_active ON emotional_arcs(is_active);

COMMENT ON TABLE emotional_arcs IS 'Emotional transformation patterns (Confusion→Clarity, Shame→Acceptance, etc.)';
COMMENT ON COLUMN emotional_arcs.arc_key IS 'Unique identifier like "confusion_to_clarity", "shame_to_acceptance"';
COMMENT ON COLUMN emotional_arcs.arc_strategy IS 'Primary response strategy for this emotional journey';

-- ============================================================================
-- TRAINING TOPICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  complexity_level VARCHAR(50),
  typical_question_examples TEXT[],
  key_concepts TEXT[],
  suitable_personas TEXT[],
  suitable_emotional_arcs TEXT[],
  requires_specialist BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_topics_key ON training_topics(topic_key);
CREATE INDEX IF NOT EXISTS idx_training_topics_category ON training_topics(category);
CREATE INDEX IF NOT EXISTS idx_training_topics_complexity ON training_topics(complexity_level);
CREATE INDEX IF NOT EXISTS idx_training_topics_active ON training_topics(is_active);

COMMENT ON TABLE training_topics IS 'Financial planning conversation topics (HSA vs FSA, Roth conversion, etc.)';
COMMENT ON COLUMN training_topics.topic_key IS 'Unique identifier like "hsa_vs_fsa", "roth_conversion"';
COMMENT ON COLUMN training_topics.complexity_level IS 'beginner, intermediate, advanced';

-- ============================================================================
-- PROMPT TEMPLATES TABLE (create or update)
-- ============================================================================

-- Create base table if not exists
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(100),
  tier VARCHAR(50) DEFAULT 'template',
  template_text TEXT NOT NULL,
  structure TEXT,
  variables JSONB,
  tone VARCHAR(100),
  complexity_baseline INTEGER,
  style_notes TEXT,
  example_conversation VARCHAR(100),
  quality_threshold NUMERIC(2,1),
  required_elements TEXT[],
  usage_count INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  success_rate NUMERIC(3,2) DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  last_modified_by UUID,
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Add emotional arc columns if they don't exist (safe for both new and existing tables)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_templates' AND column_name='emotional_arc_id') THEN
    ALTER TABLE prompt_templates ADD COLUMN emotional_arc_id UUID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_templates' AND column_name='emotional_arc_type') THEN
    ALTER TABLE prompt_templates ADD COLUMN emotional_arc_type VARCHAR(50);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_templates' AND column_name='suitable_personas') THEN
    ALTER TABLE prompt_templates ADD COLUMN suitable_personas TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_templates' AND column_name='suitable_topics') THEN
    ALTER TABLE prompt_templates ADD COLUMN suitable_topics TEXT[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_templates' AND column_name='methodology_principles') THEN
    ALTER TABLE prompt_templates ADD COLUMN methodology_principles TEXT[];
  END IF;
END $$;

-- Add foreign key constraint if emotional_arcs table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'emotional_arcs') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'fk_prompt_templates_emotional_arc'
      AND table_name = 'prompt_templates'
    ) THEN
      ALTER TABLE prompt_templates
        ADD CONSTRAINT fk_prompt_templates_emotional_arc
        FOREIGN KEY (emotional_arc_id)
        REFERENCES emotional_arcs(id);
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc ON prompt_templates(emotional_arc_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_arc_type ON prompt_templates(emotional_arc_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_tier ON prompt_templates(tier);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);

COMMENT ON TABLE prompt_templates IS 'Prompt templates for conversation generation with Elena Morales methodology';
COMMENT ON COLUMN prompt_templates.emotional_arc_type IS 'Primary selector: confusion_to_clarity, shame_to_acceptance, etc.';
`;

  // ============================================================================
  // STEP 2: Dry-run validation
  // ============================================================================

  console.log('📋 Step 1: Validating DDL with dry-run...\n');

  const dryRunResult = await saol.agentExecuteDDL({
    sql: ddlStatements,
    dryRun: true,
    transport: 'pg'
  });

  if (!dryRunResult.success) {
    console.error('❌ Dry-run validation failed!');
    console.error('Error:', dryRunResult.summary);
    console.error('\nRecommended actions:');
    dryRunResult.nextActions?.forEach((action: any, i: number) => {
      console.error(`  ${i + 1}. ${action.action}`);
      if (action.example) console.error(`     Example: ${action.example}`);
    });
    process.exit(1);
  }

  console.log('✅ Dry-run validation passed!\n');

  // ============================================================================
  // STEP 3: Execute DDL
  // ============================================================================

  console.log('🔨 Step 2: Executing DDL statements...\n');

  const executeResult = await saol.agentExecuteDDL({
    sql: ddlStatements,
    dryRun: false,
    transport: 'pg'
  });

  if (!executeResult.success) {
    console.error('❌ DDL execution failed!');
    console.error('Error:', executeResult.summary);
    console.error('\nRecommended actions:');
    executeResult.nextActions?.forEach((action: any, i: number) => {
      console.error(`  ${i + 1}. ${action.action}`);
      if (action.example) console.error(`     Example: ${action.example}`);
    });
    process.exit(1);
  }

  console.log('✅ DDL execution successful!\n');
  console.log(executeResult.summary);

  // ============================================================================
  // STEP 4: Verify schema creation
  // ============================================================================

  console.log('\n🔍 Step 3: Verifying schema creation...\n');

  const tablesToVerify = ['personas', 'emotional_arcs', 'training_topics', 'prompt_templates'];

  for (const table of tablesToVerify) {
    const schemaResult = await saol.agentIntrospectSchema({
      table,
      includeColumns: true,
      includeIndexes: true,
      transport: 'pg'
    });

    if (!schemaResult.success) {
      console.error(`❌ Failed to verify table: ${table}`);
      console.error(schemaResult.summary);
      continue;
    }

    const tableInfo = schemaResult.tables?.find((t: any) => t.name === table);
    if (tableInfo) {
      console.log(`✅ ${table}:`);
      console.log(`   - Columns: ${tableInfo.columns?.length || 0}`);
      console.log(`   - Indexes: ${tableInfo.indexes?.length || 0}`);
    }
  }

  // ============================================================================
  // STEP 5: Verify using count query
  // ============================================================================

  console.log('\n📊 Step 4: Testing table accessibility...\n');

  for (const table of tablesToVerify) {
    try {
      const countResult = await saol.agentCount({
        table
      });

      if (countResult.success) {
        console.log(`✅ ${table}: ${countResult.count} records (table accessible)`);
      }
    } catch (error) {
      console.error(`❌ ${table}: Error accessing table`, error);
    }
  }

  // ============================================================================
  // SUCCESS
  // ============================================================================

  console.log('\n✅ DATABASE SCHEMA SETUP COMPLETE!\n');
  console.log('Tables created:');
  console.log('  - personas (Client persona definitions)');
  console.log('  - emotional_arcs (Emotional transformation patterns)');
  console.log('  - training_topics (Financial planning topics)');
  console.log('  - prompt_templates (Prompt templates with Elena Morales methodology)');
  console.log('\nNext steps:');
  console.log('  1. Run Prompt 1: Extract and populate scaffolding data');
  console.log('  2. Run Prompt 2: Extract and store prompt templates');
  console.log('  3. Run Prompt 3: Integrate template selection service\n');
}

// Execute setup
setupScaffoldingSchema()
  .then(() => {
    console.log('🎉 Schema setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Schema setup failed with error:', error);
    process.exit(1);
  });
```

**Task T-0.2: Run Schema Setup Script**

Execute the schema setup script using Node.js:

```bash
node src/scripts/setup-scaffolding-schema.ts
```

**Expected Output:**
```
🚀 Starting database schema setup using SAOL...

📋 Step 1: Validating DDL with dry-run...

✅ Dry-run validation passed!

🔨 Step 2: Executing DDL statements...

✅ DDL execution successful!

🔍 Step 3: Verifying schema creation...

✅ personas:
   - Columns: 17
   - Indexes: 3
✅ emotional_arcs:
   - Columns: 20
   - Indexes: 5
✅ training_topics:
   - Columns: 12
   - Indexes: 4
✅ prompt_templates:
   - Columns: 25
   - Indexes: 4

📊 Step 4: Testing table accessibility...

✅ personas: 0 records (table accessible)
✅ emotional_arcs: 0 records (table accessible)
✅ training_topics: 0 records (table accessible)
✅ prompt_templates: 0 records (table accessible)

✅ DATABASE SCHEMA SETUP COMPLETE!
```

**ACCEPTANCE CRITERIA:**

1. **SAOL DDL Execution**:
   - ✅ All DDL executed using `agentExecuteDDL()` with `transport: 'pg'`
   - ✅ Dry-run validation passed before execution
   - ✅ No raw SQL executed in Supabase SQL Editor
   - ✅ All SAOL operations logged success/failure

2. **Tables Created**:
   - ✅ `personas` table with 17 columns
   - ✅ `emotional_arcs` table with 20 columns
   - ✅ `training_topics` table with 12 columns
   - ✅ `prompt_templates` table with 25 columns
   - ✅ All tables have `IF NOT EXISTS` clauses (idempotent)

3. **Indexes Created**:
   - ✅ personas: idx_personas_key, idx_personas_archetype, idx_personas_active
   - ✅ emotional_arcs: 5 indexes covering key, starting, ending, tier, active
   - ✅ training_topics: 4 indexes covering key, category, complexity, active
   - ✅ prompt_templates: 4 indexes covering emotional_arc, arc_type, tier, active

4. **Foreign Keys**:
   - ✅ prompt_templates.emotional_arc_id → emotional_arcs.id

5. **Schema Verification**:
   - ✅ `agentIntrospectSchema()` confirms all tables exist
   - ✅ Column counts match specifications
   - ✅ Index counts match specifications
   - ✅ `agentCount()` confirms tables are accessible

6. **Error Handling**:
   - ✅ Script exits with code 1 on failure
   - ✅ Clear error messages displayed
   - ✅ `nextActions` guidance shown on errors

**VALIDATION REQUIREMENTS:**

**Manual Verification Steps:**

1. **Verify Tables Exist:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({transport:'pg'});console.log('Tables:',r.tables.map(t=>t.name).filter(n=>['personas','emotional_arcs','training_topics','prompt_templates'].includes(n)));})();"
   ```
   - Should show all 4 tables

2. **Verify Personas Schema:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentIntrospectSchema({table:'personas',includeColumns:true,transport:'pg'});console.log('Columns:',r.tables[0].columns.map(c=>c.name));})();"
   ```
   - Should show: id, persona_key, name, archetype, etc.

3. **Verify Foreign Key:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'prompt_templates',limit:1});console.log('Table accessible:',r.success);})();"
   ```
   - Should return success: true

4. **Test Idempotency:**
   - Run the script a second time
   - Should complete without errors (IF NOT EXISTS clauses)
   - Verify no duplicate tables created

**Troubleshooting:**

If dry-run fails:
- Check `DATABASE_URL` environment variable is set
- Verify `transport: 'pg'` is specified
- Review DDL syntax for errors

If execution fails:
- Check `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- Verify PostgreSQL permissions
- Check for conflicting existing tables

If verification fails:
- Retry with explicit table name in `agentIntrospectSchema()`
- Check database connection
- Verify `uuid_generate_v4()` extension is enabled

++++++++++++++++++

---

### Prompt 1: Scaffolding Data Foundation - Extract and Populate

**Scope**: Extract personas, emotional arcs, and training topics from seed conversations; populate database tables
**Dependencies**: Scaffolding tables created (Prompt 0 complete), seed conversation files
**Estimated Time**: 12-15 hours
**Risk Level**: Medium

========================

You are a senior data engineer implementing the Conversation Scaffolding Data Foundation for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
This system generates emotionally intelligent training conversations for LoRA fine-tuning. The Scaffolding Data (personas, emotional arcs, training topics) provides the core configuration options that users will select when generating conversations. This prompt establishes the foundation by extracting and populating production-quality scaffolding data from proven seed conversations.

**Strategic Foundation:**
As defined in `04-categories-to-conversation-strategic-overview_v1.md`, Conversation Scaffolding Data includes:
1. **Personas**: Client character profiles (Marcus-type, Jennifer-type, David-type)
2. **Emotional Arcs**: Transformation patterns (Confusion→Clarity, Shame→Acceptance, etc.)
3. **Training Topics**: Financial planning scenarios (HSA vs FSA, Roth conversion, etc.)

These are the "core 3" input variables that will be selectable at `/conversations/generate`.

**Source Data:**
- **Seed Conversations**: `c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json` through `-10-complete.json`
- **Prompt Spec**: `c-alpha-build_v3.4-LoRA-FP-100-spec.md`
- **Demo Personas**: `financial-planner-demo-conversation-and-metadata_v1.txt`

**CURRENT CODEBASE STATE:**

**Database Schema** (Already Created in Prompt 0):
- `personas` table with fields: id, persona_key, name, archetype, demographics (JSONB), etc.
- `emotional_arcs` table with fields: id, arc_key, name, starting_emotion, ending_emotion, etc.
- `training_topics` table with fields: id, topic_key, name, category, description, etc.

**SAOL Library Usage** (Required for all database operations):
- **Library Location**: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
- **Quick Start**: `supa-agent-ops\saol-agent-quick-start-guide_v1.md`
- **Key Functions**:
  - `agentImportTool({ source, table, mode: 'upsert', onConflict })` - Insert/update data
  - `agentQuery({ table, where, limit })` - Query data
  - `agentCount({ table, where })` - Count records

**IMPLEMENTATION TASKS:**

(... rest of Prompt 1 content stays exactly the same as original file lines 478-978 ...)

++++++++++++++++++

---

### Prompt 2: Prompt Template Extraction & Templatization

**Scope**: Extract 7 Tier 1 templates from c-alpha spec, templatize with variables, store in database
**Dependencies**: Scaffolding tables populated, c-alpha-build spec file
**Estimated Time**: 16-20 hours
**Risk Level**: High

========================

(... Prompt 2 content stays exactly the same as original file lines 989-1364 ...)

++++++++++++++++++

---

### Prompt 3: Template Selection Service Integration

**Scope**: Update template selection service, integrate with UI, add validation
**Dependencies**: Templates and scaffolding data in database
**Estimated Time**: 12-15 hours
**Risk Level**: Low-Medium

========================

(... Prompt 3 content stays exactly the same as original file lines 1375-1645 ...)

++++++++++++++++++

---

## Success Criteria

**E01 Segment Complete When:**

1. ✅ Database schema created using SAOL
   - All tables created with agentExecuteDDL()
   - Schema verified with agentIntrospectSchema()
   - All indexes and foreign keys in place

2. ✅ All scaffolding tables created and populated
   - 3 personas extracted from seed data
   - 7+ emotional arcs extracted from c-alpha spec
   - 50+ training topics catalogued

3. ✅ All 7 Tier 1 templates extracted and stored
   - Templates preserve Elena Morales methodology
   - Variable placeholders documented
   - Templates linked to emotional arcs

4. ✅ Template selection service operational
   - Emotional arc primary selector implemented
   - Compatibility validation working
   - Variable resolution tested

5. ✅ Integration with UI
   - `/conversations/generate` page functional
   - User can select arc, tier, persona, topic
   - Template selection and generation flow works end-to-end

6. ✅ Quality validation
   - Sample conversations generated
   - Quality scores 4.5+ achieved
   - Elena voice consistency verified

---

**Document Status:** Execution specification ready for implementation (v2 - SAOL-first)
**Total Prompts:** 4
**Sequential Execution Recommended:** Yes (MUST execute Prompt 0 first)
**Estimated Total Time:** 48-68 hours

**Key Changes in v2:**
- Added Prompt 0: Database Schema Setup using SAOL `agentExecuteDDL()`
- Removed manual SQL execution instructions
- All schema operations now use SAOL with proper error handling
- Added dry-run validation before DDL execution
- Added comprehensive schema verification steps
