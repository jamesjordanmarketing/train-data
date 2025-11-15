# Categories-to-Conversations: Templates Implementation - Execution Specification (E01)

**Generated**: 2025-11-14
**Segment**: E01 - Prompt Templates & Conversation Scaffolding Data
**Total Prompts**: 3
**Estimated Implementation Time**: 40-60 hours
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
  - Use SAOL for all schema operations
  - Test migrations on development database first
  - Create rollback scripts for each migration
  - Validate foreign key constraints carefully

### Prompt Sequencing Logic

**Sequence Rationale:**

**Prompt 1: Scaffolding Data Foundation**
- **Why First**: Templates depend on scaffolding data for variables
- **Scope**: Create personas, emotional_arcs, training_topics tables; populate from seed data
- **Output**: Working scaffolding tables with validated data

**Prompt 2: Prompt Template Extraction & Storage**
- **Why Second**: Core template content needs scaffolding references
- **Scope**: Extract 7 templates from c-alpha spec, templatize with variables, store in database
- **Output**: Production-ready templates with variable placeholders

**Prompt 3: Template Selection & Integration**
- **Why Third**: Selection logic needs both scaffolding data and templates
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

## Database Setup Instructions

### Required SQL Operations

Execute these SQL statements in Supabase SQL Editor BEFORE implementing prompts.

========================

```sql
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

CREATE INDEX idx_personas_key ON personas(persona_key);
CREATE INDEX idx_personas_archetype ON personas(archetype);
CREATE INDEX idx_personas_active ON personas(is_active);

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

CREATE INDEX idx_emotional_arcs_key ON emotional_arcs(arc_key);
CREATE INDEX idx_emotional_arcs_starting ON emotional_arcs(starting_emotion);
CREATE INDEX idx_emotional_arcs_ending ON emotional_arcs(ending_emotion);
CREATE INDEX idx_emotional_arcs_tier ON emotional_arcs(tier);
CREATE INDEX idx_emotional_arcs_active ON emotional_arcs(is_active);

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

CREATE INDEX idx_training_topics_key ON training_topics(topic_key);
CREATE INDEX idx_training_topics_category ON training_topics(category);
CREATE INDEX idx_training_topics_complexity ON training_topics(complexity_level);
CREATE INDEX idx_training_topics_active ON training_topics(is_active);

COMMENT ON TABLE training_topics IS 'Financial planning conversation topics (HSA vs FSA, Roth conversion, etc.)';
COMMENT ON COLUMN training_topics.topic_key IS 'Unique identifier like "hsa_vs_fsa", "roth_conversion"';
COMMENT ON COLUMN training_topics.complexity_level IS 'beginner, intermediate, advanced';

-- ============================================================================
-- UPDATE PROMPT_TEMPLATES TABLE (if exists, otherwise create)
-- ============================================================================

-- Add new columns to existing prompt_templates table
DO $$
BEGIN
  -- Check if table exists, create if not
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'prompt_templates') THEN
    CREATE TABLE prompt_templates (
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
  END IF;

  -- Add emotional arc columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='prompt_templates' AND column_name='emotional_arc_id') THEN
    ALTER TABLE prompt_templates ADD COLUMN emotional_arc_id UUID REFERENCES emotional_arcs(id);
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

CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc ON prompt_templates(emotional_arc_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_arc_type ON prompt_templates(emotional_arc_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_tier ON prompt_templates(tier);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);

COMMENT ON TABLE prompt_templates IS 'Prompt templates for conversation generation with Elena Morales methodology';
COMMENT ON COLUMN prompt_templates.emotional_arc_type IS 'Primary selector: confusion_to_clarity, shame_to_acceptance, etc.';

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (Optional for POC, required for production)
-- ============================================================================

-- ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE emotional_arcs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE training_topics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Policies can be added later when multi-tenant support is needed

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables created
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('personas', 'emotional_arcs', 'training_topics', 'prompt_templates')
ORDER BY table_name, ordinal_position;

-- Verify indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('personas', 'emotional_arcs', 'training_topics', 'prompt_templates')
ORDER BY tablename, indexname;
```

**Validation Steps:**
1. Run the migration in Supabase SQL Editor
2. Verify all 4 tables created (personas, emotional_arcs, training_topics, prompt_templates)
3. Verify indexes created for each table
4. Check foreign key from prompt_templates.emotional_arc_id to emotional_arcs.id
5. Confirm all columns have correct data types and constraints

++++++++++++++++++

---

## Implementation Prompts

### Prompt 1: Scaffolding Data Foundation - Extract and Populate

**Scope**: Extract personas, emotional arcs, and training topics from seed conversations; populate database tables
**Dependencies**: Scaffolding tables created (migration above), seed conversation files
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

**Database Schema** (Already Created):
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

**Task T-1.1: Extract Persona Data**

Read seed conversation files and the demo personas document to extract all persona definitions.

**Step 1**: Create persona extraction script at `src/scripts/extract-personas-from-seeds.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

// Persona interface matching database schema
interface PersonaData {
  persona_key: string;
  name: string;
  archetype: string;
  age_range: string;
  occupation: string;
  income_range: string;
  demographics: {
    age?: number;
    gender?: string;
    family_status?: string;
    location?: string;
  };
  financial_background: string;
  financial_situation: string;
  communication_style: string;
  emotional_baseline: string;
  typical_questions: string[];
  common_concerns: string[];
  language_patterns: string[];
  is_active: boolean;
}

// Extract personas from seed conversations
function extractPersonasFromSeeds(): PersonaData[] {
  const personas: PersonaData[] = [];

  // Define 3 core personas from seed data
  personas.push({
    persona_key: 'overwhelmed_avoider',
    name: 'Marcus Chen',
    archetype: 'The Overwhelmed Avoider',
    age_range: '35-40',
    occupation: 'Tech Worker / Software Engineer',
    income_range: '$120,000-$160,000',
    demographics: {
      age: 37,
      gender: 'male',
      family_status: 'single or married without kids',
      location: 'Urban/Suburban'
    },
    financial_background: 'High earner with complex compensation (RSUs, stock options). Good income but feels paralyzed by complexity. Often avoids financial decisions due to overwhelm. Has resources but lacks financial confidence.',
    financial_situation: 'Solid income from tech job with equity compensation. 401k exists but not optimized. Emergency fund present but inconsistent. Tends to default to cash/safe options due to analysis paralysis.',
    communication_style: 'Apologetic and self-deprecating. Frequently says "I know I should know this" or "This might be a stupid question." Detailed explainer when sharing situation. Shows relief when complexity is normalized.',
    emotional_baseline: 'Low-level anxiety about money despite good income. Shame about not "having it together" financially. Relief-seeking - wants permission to not be perfect.',
    typical_questions: [
      'RSU tax implications and timing strategies',
      'How to prioritize between multiple financial goals',
      'Whether current savings rate is "enough"',
      'Complex financial product comparisons (HSA vs FSA, Roth vs Traditional)',
      'Investment options for non-retirement money'
    ],
    common_concerns: [
      'Making the "wrong" choice and regretting it',
      'Not maximizing tax advantages due to ignorance',
      'Being judged for not knowing "basic" things',
      'Having money but not feeling financially secure',
      'Comparison to peers who "seem to have it figured out"'
    ],
    language_patterns: [
      'Uses disclaimers: "I know this might sound stupid..."',
      'Self-deprecating humor about financial ignorance',
      'Provides extensive context before asking question',
      'Expresses relief when confusion is normalized',
      'Says "I should probably know this by now"'
    ],
    is_active: true
  });

  personas.push({
    persona_key: 'anxious_planner',
    name: 'Jennifer Martinez',
    archetype: 'The Anxious Planner',
    age_range: '40-45',
    occupation: 'Professional / Manager',
    income_range: '$100,000-$140,000',
    demographics: {
      age: 42,
      gender: 'female',
      family_status: 'married with children',
      location: 'Suburban'
    },
    financial_background: 'Financially organized but anxiety-driven. Tracks every dollar. Worries constantly about future scenarios. Over-researches decisions. Has plans but second-guesses them. High need for reassurance.',
    financial_situation: 'Solid retirement savings, emergency fund in place, insurance coverage adequate. Financially "on track" but doesn\'t feel secure. Worries about market volatility, job security, healthcare costs, college funding.',
    communication_style: 'Precise and detailed. Asks many "what if" questions. Seeks validation that choices are correct. Expresses worry explicitly. Shows vulnerability about anxiety. Grateful for reassurance.',
    emotional_baseline: 'Moderate to high anxiety about future financial security. Hypervigilance about risks. Relief when fears are reality-tested. Needs concrete security indicators.',
    typical_questions: [
      'Is my current plan enough for retirement?',
      'What happens if [catastrophic scenario] occurs?',
      'How do I protect against market crashes?',
      'Should I change strategy based on recent news?',
      'Am I making a mistake by [current choice]?'
    ],
    common_concerns: [
      'Running out of money in retirement',
      'Market crash destroying savings',
      'Job loss and inability to recover',
      'Unexpected medical costs',
      'Not providing adequately for children\'s future'
    ],
    language_patterns: [
      'Asks "what if" questions repeatedly',
      'Expresses worry explicitly: "I\'m really anxious about..."',
      'Seeks validation: "Does this seem reasonable?"',
      'Provides detailed contingency thinking',
      'Shows gratitude for reassurance: "That really helps"'
    ],
    is_active: true
  });

  personas.push({
    persona_key: 'pragmatic_optimist',
    name: 'David Chen',
    archetype: 'The Pragmatic Optimist',
    age_range: '30-38',
    occupation: 'Teacher / Public Service',
    income_range: '$65,000-$85,000',
    demographics: {
      age: 35,
      gender: 'male',
      family_status: 'married or partnership',
      location: 'Urban/Suburban'
    },
    financial_background: 'Modest but stable income. Values-driven financial decisions. Optimistic about future but practical about present constraints. Willing to make tradeoffs. Focused on meaningful goals over maximum optimization.',
    financial_situation: 'Moderate income with pension. Some retirement savings started. Budget-conscious but not deprived. Makes thoughtful choices within constraints. Prioritizes values over pure financial optimization.',
    communication_style: 'Direct and practical. Asks specific questions. Values clarity and actionable guidance. Appreciates context but wants bottom-line answers. Expresses values explicitly in financial decisions.',
    emotional_baseline: 'Generally optimistic but realistic. Some frustration when competing priorities conflict. Relief when shown third-way solutions. Motivated by values alignment.',
    typical_questions: [
      'How to balance [value A] with [value B]?',
      'What\'s the pragmatic approach to [situation]?',
      'Can I afford to [values-based choice] without sacrificing [security]?',
      'What are realistic expectations for [goal]?',
      'How do other people in my situation handle [tradeoff]?'
    ],
    common_concerns: [
      'Balancing present quality of life with future security',
      'Making values-aligned choices without financial guilt',
      'Competing priorities (wedding debt vs house, career change vs stability)',
      'Modest income limiting options',
      'External pressure to make "standard" choices'
    ],
    language_patterns: [
      'Frames questions around values and priorities',
      'Direct communication style',
      'Asks "what\'s realistic?" or "what do most people do?"',
      'Expresses both desires clearly in tradeoff scenarios',
      'Shows appreciation for practical guidance'
    ],
    is_active: true
  });

  return personas;
}

// Main execution
async function main() {
  const personas = extractPersonasFromSeeds();

  // Save to JSON file for import
  const outputPath = path.join(__dirname, '../../data/personas-seed.ndjson');
  const ndjsonContent = personas.map(p => JSON.stringify(p)).join('\n');
  fs.writeFileSync(outputPath, ndjsonContent, 'utf-8');

  console.log(`✓ Extracted ${personas.length} personas to ${outputPath}`);
  console.log('Personas:', personas.map(p => `${p.name} (${p.persona_key})`).join(', '));
}

main().catch(console.error);
```

**Step 2**: Run extraction script
```bash
npx ts-node src/scripts/extract-personas-from-seeds.ts
```

**Step 3**: Import personas into database using SAOL
```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentImportTool({source:'./data/personas-seed.ndjson',table:'personas',mode:'upsert',onConflict:'persona_key'});console.log(r.summary);})();"
```

**Task T-1.2: Extract Emotional Arc Data**

Extract emotional arc definitions from the c-alpha-build spec.

**Step 1**: Create arc extraction script at `src/scripts/extract-emotional-arcs-from-spec.ts`

```typescript
import * as fs from 'fs';
import * as path from 'path';

interface EmotionalArcData {
  arc_key: string;
  name: string;
  starting_emotion: string;
  starting_intensity_min: number;
  starting_intensity_max: number;
  ending_emotion: string;
  ending_intensity_min: number;
  ending_intensity_max: number;
  arc_strategy: string;
  key_principles: string[];
  characteristic_phrases: string[];
  response_techniques: string[];
  avoid_tactics: string[];
  typical_turn_count_min: number;
  typical_turn_count_max: number;
  complexity_baseline: number;
  tier: string;
  suitable_personas: string[];
  suitable_topics: string[];
  example_conversation_id: string;
  is_active: boolean;
}

function extractEmotionalArcsFromSpec(): EmotionalArcData[] {
  const arcs: EmotionalArcData[] = [];

  // Arc 1: Confusion → Clarity (Template A)
  arcs.push({
    arc_key: 'confusion_to_clarity',
    name: 'Confusion → Clarity',
    starting_emotion: 'confusion',
    starting_intensity_min: 0.70,
    starting_intensity_max: 0.85,
    ending_emotion: 'clarity',
    ending_intensity_min: 0.70,
    ending_intensity_max: 0.80,
    arc_strategy: 'normalize_confusion_then_educate',
    key_principles: [
      'Confusion is normal and common',
      'Break complexity into simple steps',
      'Use concrete numbers not abstractions',
      'Ask permission before educating',
      'Celebrate understanding progress'
    ],
    characteristic_phrases: [
      'I can hear the confusion in your question',
      'This is incredibly common',
      'Let\'s start simple...',
      'Would it be helpful if I explained...',
      'You\'re asking exactly the right question',
      'Does that make sense?'
    ],
    response_techniques: [
      'Normalize confusion explicitly',
      'Break down complexity step-by-step',
      'Use specific numbers ($X, Y%)',
      'Provide concrete examples',
      'Check understanding frequently'
    ],
    avoid_tactics: [
      'Using jargon without explanation',
      'Assuming knowledge level',
      'Overwhelming with too many options at once',
      'Making user feel stupid for not knowing'
    ],
    typical_turn_count_min: 3,
    typical_turn_count_max: 5,
    complexity_baseline: 7,
    tier: 'template',
    suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],
    suitable_topics: [
      'hsa_vs_fsa',
      'roth_ira_conversion',
      'life_insurance_types',
      '529_vs_utma',
      'backdoor_roth',
      'rmds_at_retirement'
    ],
    example_conversation_id: 'fp_marcus_002',
    is_active: true
  });

  // Arc 2: Shame → Acceptance (Template B)
  arcs.push({
    arc_key: 'shame_to_acceptance',
    name: 'Shame → Acceptance',
    starting_emotion: 'shame',
    starting_intensity_min: 0.70,
    starting_intensity_max: 0.90,
    ending_emotion: 'acceptance',
    ending_intensity_min: 0.55,
    ending_intensity_max: 0.70,
    arc_strategy: 'powerful_normalization_then_future_focus',
    key_principles: [
      'You are not alone - this is more common than you think',
      'There\'s no judgment here',
      'Separate past from future',
      'Celebrate courage in facing this',
      'Find and affirm existing strengths'
    ],
    characteristic_phrases: [
      'You are not alone',
      'This is more common than you think',
      'There\'s no judgment here',
      'It takes real courage to face this honestly',
      'You can\'t change the past, but you can change what happens next'
    ],
    response_techniques: [
      'Immediate powerful normalization',
      'Explicit non-judgment statement',
      'Separate past (can\'t change) from future (can)',
      'Celebrate courage in sharing',
      'Reframe existing actions as strengths',
      'Provide concrete forward path quickly'
    ],
    avoid_tactics: [
      'Never say "you should have..."',
      'Never minimize shame ("it\'s not that bad")',
      'Never rush to solutions before validating emotion',
      'Never use comparative language ("others have it worse")'
    ],
    typical_turn_count_min: 4,
    typical_turn_count_max: 5,
    complexity_baseline: 8,
    tier: 'template',
    suitable_personas: ['overwhelmed_avoider', 'anxious_planner'],
    suitable_topics: [
      'no_retirement_at_45',
      'paycheck_to_paycheck_high_income',
      'ignored_401k',
      'credit_card_debt_lifestyle',
      'hiding_financial_problems'
    ],
    example_conversation_id: 'fp_marcus_006',
    is_active: true
  });

  // Arc 3: Couple Conflict → Alignment (Template C)
  arcs.push({
    arc_key: 'couple_conflict_to_alignment',
    name: 'Couple Conflict → Alignment',
    starting_emotion: 'frustration',
    starting_intensity_min: 0.65,
    starting_intensity_max: 0.80,
    ending_emotion: 'clarity',
    ending_intensity_min: 0.75,
    ending_intensity_max: 0.85,
    arc_strategy: 'validate_both_then_show_third_way',
    key_principles: [
      'Money disagreements are common for couples',
      'Validate BOTH perspectives equally',
      'Challenge either/or thinking',
      'Show both/and possibilities',
      'Emphasize partnership throughout'
    ],
    characteristic_phrases: [
      'Money disagreements are one of the most common sources of tension for couples',
      'You\'re both bringing valid perspectives',
      'Let me validate both concerns...',
      'What if you didn\'t have to choose?',
      'How would [partner] feel about this approach?'
    ],
    response_techniques: [
      'Normalize couple money disagreements immediately',
      'Name both partners\' perspectives explicitly',
      'Challenge false dichotomies (either/or)',
      'Provide specific both/and solutions',
      'Use partnership language ("you two," "together")',
      'Check alignment: "Would [partner] feel good about this?"'
    ],
    avoid_tactics: [
      'Never take sides between partners',
      'Never dismiss either concern as "less valid"',
      'Never rush to solution before validating both',
      'Never assume traditional gender roles'
    ],
    typical_turn_count_min: 3,
    typical_turn_count_max: 4,
    complexity_baseline: 7,
    tier: 'template',
    suitable_personas: ['pragmatic_optimist', 'anxious_planner'],
    suitable_topics: [
      'wedding_debt_vs_house',
      'risk_tolerance_mismatch',
      'spending_priorities',
      'parent_support_vs_own_wealth'
    ],
    example_conversation_id: 'fp_david_002',
    is_active: true
  });

  // Add remaining arcs (Fear→Confidence, Overwhelm→Empowerment, etc.)
  // TODO: Extract remaining 4 arcs from spec

  return arcs;
}

async function main() {
  const arcs = extractEmotionalArcsFromSpec();

  const outputPath = path.join(__dirname, '../../data/emotional-arcs-seed.ndjson');
  const ndjsonContent = arcs.map(a => JSON.stringify(a)).join('\n');
  fs.writeFileSync(outputPath, ndjsonContent, 'utf-8');

  console.log(`✓ Extracted ${arcs.length} emotional arcs to ${outputPath}`);
  console.log('Arcs:', arcs.map(a => a.name).join(', '));
}

main().catch(console.error);
```

**Step 2**: Run extraction and import
```bash
npx ts-node src/scripts/extract-emotional-arcs-from-spec.ts
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentImportTool({source:'./data/emotional-arcs-seed.ndjson',table:'emotional_arcs',mode:'upsert',onConflict:'arc_key'});console.log(r.summary);})();"
```

**Task T-1.3: Extract Training Topic Data**

Extract topics from seed conversations and spec.

**Step 1**: Create topic extraction script at `src/scripts/extract-training-topics-from-seeds.ts`

(Include extraction logic for 50+ topics from spec and seed conversations, categorized by domain)

**Step 2**: Run extraction and import
```bash
npx ts-node src/scripts/extract-training-topics-from-seeds.ts
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentImportTool({source:'./data/training-topics-seed.ndjson',table:'training_topics',mode:'upsert',onConflict:'topic_key'});console.log(r.summary);})();"
```

**ACCEPTANCE CRITERIA:**

1. **Persona Data Quality**:
   - ✅ 3 core personas extracted (Marcus-type, Jennifer-type, David-type)
   - ✅ All persona fields populated with accurate data from seed conversations
   - ✅ Each persona has 5+ typical_questions and 5+ common_concerns
   - ✅ Demographics JSONB includes age, gender, family_status
   - ✅ Each persona traceable to seed conversations where they appear

2. **Emotional Arc Data Quality**:
   - ✅ 7+ emotional arcs extracted from c-alpha-build spec
   - ✅ All intensity ranges (min/max) accurately reflect spec
   - ✅ characteristic_phrases preserve exact Elena language
   - ✅ response_techniques and avoid_tactics comprehensive
   - ✅ suitable_personas and suitable_topics arrays populated
   - ✅ Each arc linked to example_conversation_id

3. **Training Topic Data Quality**:
   - ✅ 50+ training topics extracted
   - ✅ Topics categorized correctly (retirement, investment, insurance, etc.)
   - ✅ complexity_level assigned (beginner/intermediate/advanced)
   - ✅ typical_question_examples include 3+ real questions
   - ✅ suitable_personas and suitable_emotional_arcs arrays populated

4. **Database Population**:
   - ✅ All data imported successfully using SAOL
   - ✅ No duplicate records (upsert on conflict works correctly)
   - ✅ Foreign key relationships valid
   - ✅ All is_active flags set to true for seed data

5. **Code Quality**:
   - ✅ Extraction scripts are TypeScript with strict typing
   - ✅ Scripts are rerunnable (idempotent)
   - ✅ NDJSON format used for data files
   - ✅ Clear console logging of extraction results

**VALIDATION REQUIREMENTS:**

**Manual Testing Steps:**

1. **Verify Persona Import:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'personas',limit:10});console.log(JSON.stringify(r.data,null,2));})();"
   ```
   - Confirm 3 personas returned
   - Check all fields populated correctly

2. **Verify Emotional Arc Import:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'emotional_arcs',limit:10});console.log(JSON.stringify(r.data,null,2));})();"
   ```
   - Confirm 7+ arcs returned
   - Verify intensity ranges valid (0-1)

3. **Verify Training Topic Import:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentCount({table:'training_topics'});console.log('Total topics:',r.count);})();"
   ```
   - Confirm 50+ topics imported

4. **Cross-Reference Validation:**
   - Pick random persona (e.g., 'overwhelmed_avoider')
   - Find emotional arcs where persona is in suitable_personas array
   - Find topics where persona is in suitable_personas array
   - Verify combinations make logical sense

++++++++++++++++++

---

### Prompt 2: Prompt Template Extraction & Templatization

**Scope**: Extract 7 Tier 1 templates from c-alpha spec, templatize with variables, store in database
**Dependencies**: Scaffolding tables populated, c-alpha-build spec file
**Estimated Time**: 16-20 hours
**Risk Level**: High

========================

You are a senior prompt engineer implementing the Prompt Template Extraction and Templatization system for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
Prompt templates are the core engine that transforms scaffolding data (personas, emotional arcs, topics) into emotionally intelligent training conversations. Each template embeds Elena Morales' methodology and includes variable placeholders that will be populated at runtime. This prompt extracts production-ready templates from the proven c-alpha-build specification.

**Template Organization Principle** (CRITICAL):
- **Primary Selector**: Emotional Arc (not topic, not tier)
- **Selection Flow**: User selects Arc → System narrows to templates with that arc → User selects Tier → Variables injected
- **Template Naming**: "[Tier] - [Emotional Arc] - [Variant]"

**Source Documents:**
- **Prompt Source**: `c-alpha-build_v3.4-LoRA-FP-100-spec.md` (lines 49-1490)
- **Template Spec**: `04-categories-to-conversation-templates_spec_v1.md` (lines 299-1073)
- **Seed Conversations**: For validation and examples

**CURRENT CODEBASE STATE:**

**Database Schema**:
- `prompt_templates` table with fields: template_name, template_text, emotional_arc_id, emotional_arc_type, suitable_personas, suitable_topics, methodology_principles, variables (JSONB)

**Existing Services**:
- `src/lib/services/template-service.ts` - Template CRUD
- `src/lib/services/template-resolver.ts` - Variable resolution

**IMPLEMENTATION TASKS:**

**Task T-2.1: Extract Template A (Confusion → Clarity)**

Read PROMPT 1 from c-alpha-build spec (lines 49-328) and extract the complete template.

**Step 1**: Identify prompt boundaries in spec file
- Start delimiter: `==========` (line 57)
- End delimiter: `++++++++++` (line 324)
- Everything between is the template text

**Step 2**: Create template definition file at `src/lib/templates/definitions/tier1-templates/confusion-to-clarity.ts`

```typescript
export const CONFUSION_TO_CLARITY_TEMPLATE = {
  template_name: 'Template - Confusion → Clarity - Education Focus',
  emotional_arc_type: 'confusion_to_clarity',
  tier: 'template',
  category: 'educational',
  description: 'Guides clients from genuine confusion about financial concepts to clear understanding through judgment-free education. Most common arc for complex financial topics.',

  template_text: `You are tasked with generating a complete, production-quality LoRA training conversation for a financial planning chatbot.

## Conversation Configuration

**Client Persona:** {{persona_name}} - {{persona_archetype}}
**Emotional Journey:** {{starting_emotion}} ({{starting_intensity_min}}-{{starting_intensity_max}} intensity) → {{ending_emotion}} ({{ending_intensity_min}}-{{ending_intensity_max}} intensity)
**Topic:** {{topic_name}}
**Complexity:** {{topic_complexity}}
**Target Turns:** {{typical_turn_count_min}}-{{typical_turn_count_max}}

## Context and Quality Standards

You must generate a conversation that achieves 5/5 quality matching the seed conversation standard.

## Emotional Arc Pattern: {{emotional_arc_name}}

**Turn 1:**
- User expresses confusion about {{topic_name}}
- Likely includes self-deprecation ("this might sound stupid")
- Shows decision paralysis from complexity
- **Elena Response:** Normalize confusion, reframe to positive, offer to break down complexity

**Turn 2:**
- User provides details, shows slight relief at normalization
- May reveal specific decision to be made
- **Elena Response:** Break concept into simple steps, use concrete numbers, ask permission to educate

**Turn 3-4:**
- User asks follow-up questions, shows growing understanding
- May express concern about making wrong choice
- **Elena Response:** Continue education, validate fears, provide specific actionable guidance

**Turn 5 (if applicable):**
- User expresses clarity and readiness to act
- May show gratitude or empowerment
- **Elena Response:** Celebrate transformation, reinforce confidence, offer continued support

## Elena Morales Voice Requirements (CRITICAL)

**Must maintain ALL of Elena's principles:**

1. **Money is emotional** - Acknowledge feelings before facts in EVERY response
2. **Judgment-free space** - Normalize confusion explicitly ("this is incredibly common")
3. **Education-first** - Teach "why" not just "what"
4. **Progress over perfection** - Celebrate existing understanding
5. **Values-aligned** - Personal context over generic rules

**Communication Patterns:**
- Acknowledges emotions explicitly: "I can hear the confusion in your question"
- Uses concrete numbers: "$6,500 annual limit" not "there's a limit"
- Asks permission: "Would it be helpful if I explained..."
- Breaks complexity: "Let's start simple..."
- Celebrates progress: "You're asking exactly the right question"
- Never uses jargon without explanation
- Ends with support: "Does that make sense?"

## Client Background

**Persona:** {{persona_name}}
**Demographics:** {{persona_demographics}}
**Financial Situation:** {{persona_financial_background}}
**Communication Style:** {{persona_communication_style}}

**Typical Questions This Persona Asks:**
{{persona_typical_questions}}

**Common Concerns:**
{{persona_common_concerns}}

**Language Patterns to Expect:**
{{persona_language_patterns}}

## Topic Context

**Topic:** {{topic_name}}
**Description:** {{topic_description}}
**Complexity Level:** {{topic_complexity}}

**Typical Questions Clients Ask About This Topic:**
{{topic_example_questions}}

**Key Concepts to Address:**
{{topic_key_concepts}}

## Output Format

Generate a complete JSON conversation following this exact schema:

[Full JSON schema from c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json]

**For EACH turn, generate:**
- Full conversation_metadata (only in turn 1)
- System prompt with all 5 Elena principles
- Conversation history (previous turns)
- Current user input (authentic, shows confusion)
- Complete emotional_context with detected_emotions, emotional_indicators, behavioral_assessment, client_needs_hierarchy
- Complete response_strategy with primary_strategy, rationale, tone_selection, tactical_choices
- Target response (Elena's full response, 200-400 words)
- Complete response_breakdown with EVERY sentence analyzed and word_choice_rationale (3-6 key phrases per sentence)
- Expected user response patterns
- Training metadata with quality scores (all 5/5)

## Execution Instructions

1. Generate Turn 1: User expresses confusion about {{topic_name}}
2. Generate Elena's Turn 1 response with complete annotations
3. Generate Turn 2: User provides details, slight relief
4. Generate Elena's Turn 2 response with complete annotations
5. Continue for {{target_turn_count}} turns total
6. Ensure emotional progression: {{starting_emotion}} ({{starting_intensity_min}}) → Recognition (0.65) → {{ending_emotion}} ({{ending_intensity_min}})
7. Every field fully populated (no TODOs or placeholders)

## Success Criteria

✅ Conversation achieves 5/5 quality (match seed conversation standard)
✅ Every sentence analyzed with 3-6 word choice rationales
✅ Emotional progression realistic across all turns
✅ Elena's voice perfectly consistent throughout
✅ Financial advice accurate and safe for {{topic_name}}
✅ Numbers realistic for {{persona_name}}'s situation
✅ Zero placeholders or TODOs
✅ Ready for immediate LoRA training use

## Begin Generation

Generate the complete {{target_turn_count}}-turn conversation now, following all requirements above.`,

  structure: "Turn 1: Express confusion → Turn 2: Normalize + educate → Turn 3: Follow-up + understanding → Turn 4: Clarity + confidence → Turn 5 (optional): Action readiness",

  variables: {
    required: [
      "persona_name", "persona_archetype", "persona_demographics",
      "persona_financial_background", "persona_communication_style",
      "persona_typical_questions", "persona_common_concerns",
      "persona_language_patterns",
      "starting_emotion", "starting_intensity_min", "starting_intensity_max",
      "ending_emotion", "ending_intensity_min", "ending_intensity_max",
      "emotional_arc_name",
      "topic_name", "topic_description", "topic_complexity",
      "topic_example_questions", "topic_key_concepts",
      "typical_turn_count_min", "typical_turn_count_max",
      "target_turn_count"
    ],
    optional: [
      "chunk_context", "document_id"
    ]
  },

  tone: 'warm, professional, never condescending, deeply empathetic',
  complexity_baseline: 7,

  style_notes: 'Core philosophy: Confusion is normal and common. Break complexity into simple steps. Use concrete numbers. Ask permission to educate. Celebrate understanding progress.',

  example_conversation: 'c-alpha-build_v3.4-LoRA-FP-convo-01-complete.json (fp_marcus_002)',

  quality_threshold: 4.5,

  required_elements: [
    'explicit_emotion_acknowledgment',
    'normalization_statement',
    'concrete_numbers_or_examples',
    'permission_asking',
    'complexity_breakdown',
    'progress_celebration',
    'jargon_avoidance'
  ],

  suitable_personas: ['overwhelmed_avoider', 'anxious_planner', 'pragmatic_optimist'],

  suitable_topics: [
    'hsa_vs_fsa_decision',
    'roth_ira_conversion',
    'life_insurance_types',
    '529_vs_utma',
    'backdoor_roth',
    'rmds_at_retirement',
    'mega_backdoor_roth',
    'donor_advised_funds',
    'tax_loss_harvesting',
    'index_vs_mutual_vs_etf'
  ],

  methodology_principles: ['judgment_free_space', 'education_first', 'progress_over_perfection']
};
```

**Step 3**: Repeat for remaining 6 Tier 1 templates
- Template B: Shame → Acceptance
- Template C: Couple Conflict → Alignment
- Template D: Fear → Confidence (Anxiety → Confidence)
- Template E: Grief/Loss → Healing
- Template F: Overwhelm → Empowerment
- Template G: Plateau → Breakthrough (or Emergency → Calm)

**Task T-2.2: Create Template Import Script**

Create `src/scripts/populate-templates.ts` to import all template definitions into database.

```typescript
import { CONFUSION_TO_CLARITY_TEMPLATE } from '../lib/templates/definitions/tier1-templates/confusion-to-clarity';
// Import other templates...

async function populateTemplates() {
  const saol = require('../../supa-agent-ops');
  const templates = [
    CONFUSION_TO_CLARITY_TEMPLATE,
    // Add other templates...
  ];

  console.log(`Importing ${templates.length} templates...`);

  for (const template of templates) {
    // 1. Get emotional arc ID
    const arcResult = await saol.agentQuery({
      table: 'emotional_arcs',
      where: [{ column: 'arc_key', operator: 'eq', value: template.emotional_arc_type }],
      limit: 1
    });

    if (!arcResult.data || arcResult.data.length === 0) {
      console.error(`❌ Emotional arc not found: ${template.emotional_arc_type}`);
      continue;
    }

    const emotionalArcId = arcResult.data[0].id;

    // 2. Prepare template record
    const templateRecord = {
      template_name: template.template_name,
      description: template.description,
      category: template.category,
      tier: template.tier,
      template_text: template.template_text,
      structure: template.structure,
      variables: template.variables,
      tone: template.tone,
      complexity_baseline: template.complexity_baseline,
      style_notes: template.style_notes,
      example_conversation: template.example_conversation,
      quality_threshold: template.quality_threshold,
      required_elements: template.required_elements,
      emotional_arc_id: emotionalArcId,
      emotional_arc_type: template.emotional_arc_type,
      suitable_personas: template.suitable_personas,
      suitable_topics: template.suitable_topics,
      methodology_principles: template.methodology_principles,
      usage_count: 0,
      rating: 0,
      success_rate: 0,
      version: 1,
      is_active: true
    };

    // 3. Import using SAOL
    const importResult = await saol.agentImportTool({
      source: [templateRecord],
      table: 'prompt_templates',
      mode: 'upsert',
      onConflict: 'template_name'
    });

    if (importResult.success) {
      console.log(`✓ Imported: ${template.template_name}`);
    } else {
      console.error(`❌ Failed: ${template.template_name}`, importResult.summary);
    }
  }

  console.log('\n✅ Template population complete!');
}

populateTemplates().catch(console.error);
```

**Step 4**: Run template import
```bash
npx ts-node src/scripts/populate-templates.ts
```

**ACCEPTANCE CRITERIA:**

1. **Template Extraction**:
   - ✅ All 7 Tier 1 templates extracted from c-alpha spec
   - ✅ Template text preserves Elena Morales language exactly
   - ✅ All variable placeholders identified and documented
   - ✅ Template structure matches seed conversation patterns

2. **Variable System**:
   - ✅ All required variables listed in metadata
   - ✅ Variable naming convention consistent ({{snake_case}})
   - ✅ Variables map to scaffolding data fields
   - ✅ Optional variables clearly distinguished

3. **Template Quality**:
   - ✅ All 5 Elena principles embedded in each template
   - ✅ Response strategies specific to each emotional arc
   - ✅ Quality criteria explicit (5/5 standard)
   - ✅ Example conversation linked for validation

4. **Database Population**:
   - ✅ All templates imported successfully
   - ✅ emotional_arc_id foreign keys valid
   - ✅ suitable_personas arrays populated
   - ✅ suitable_topics arrays populated
   - ✅ No duplicate templates (upsert works)

**VALIDATION REQUIREMENTS:**

1. **Verify Template Import:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentCount({table:'prompt_templates'});console.log('Total templates:',r.count);})();"
   ```
   - Confirm 7+ templates imported

2. **Check Template Structure:**
   ```bash
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'prompt_templates',where:[{column:'emotional_arc_type',operator:'eq',value:'confusion_to_clarity'}],limit:1});console.log(JSON.stringify(r.data[0],null,2));})();"
   ```
   - Verify template_text contains all sections
   - Check variables JSONB has required and optional arrays

3. **Validate Variable Placeholders:**
   - Extract all {{variable_name}} from template_text
   - Confirm all are listed in variables.required or variables.optional
   - Verify no orphaned placeholders

++++++++++++++++++

---

### Prompt 3: Template Selection Service Integration

**Scope**: Update template selection service, integrate with UI, add validation
**Dependencies**: Templates and scaffolding data in database
**Estimated Time**: 12-15 hours
**Risk Level**: Low-Medium

========================

You are a senior full-stack developer implementing the Template Selection Service Integration for the Interactive LoRA Conversation Generation Module.

**CONTEXT AND REQUIREMENTS:**

**Product Overview:**
The Template Selection Service is the bridge between user inputs (persona, emotional arc, topic) and the prompt templates. It implements the "emotional arc as primary selector" strategy and ensures the right template is matched to user configuration.

**Selection Logic** (CRITICAL):
1. User selects **Emotional Arc** (primary selector)
2. System queries prompt_templates WHERE emotional_arc_type = selected_arc
3. User selects **Tier** (template/scenario/edge_case)
4. System further filters WHERE tier = selected_tier
5. User selects **Persona** and **Topic**
6. System validates persona IN suitable_personas AND topic IN suitable_topics
7. System returns matched template(s), user picks final template if multiple matches

**CURRENT CODEBASE STATE:**

**Existing Service**: `src/lib/services/template-selection-service.ts`
- Likely has basic template selection logic
- Needs update to prioritize emotional arc

**Template Resolver**: `src/lib/services/template-resolver.ts`
- Variable resolution logic
- Needs to handle all scaffolding variables

**IMPLEMENTATION TASKS:**

**Task T-3.1: Update Template Selection Service**

Modify `src/lib/services/template-selection-service.ts` to implement arc-first selection.

```typescript
import { createClient } from '@supabase/supabase-js';

export interface TemplateSelectionCriteria {
  emotional_arc_type: string;  // Required, primary selector
  tier?: 'template' | 'scenario' | 'edge_case';
  persona_key?: string;
  topic_key?: string;
}

export class TemplateSelectionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Select templates based on emotional arc (primary) and optional filters
   */
  async selectTemplates(criteria: TemplateSelectionCriteria): Promise<PromptTemplate[]> {
    // Step 1: Query by emotional arc (required)
    let query = this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('emotional_arc_type', criteria.emotional_arc_type)
      .eq('is_active', true);

    // Step 2: Filter by tier if provided
    if (criteria.tier) {
      query = query.eq('tier', criteria.tier);
    }

    const { data, error } = await query;

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(`No templates found for emotional arc: ${criteria.emotional_arc_type}`);
    }

    let templates = data as PromptTemplate[];

    // Step 3: Filter by persona compatibility if provided
    if (criteria.persona_key) {
      templates = templates.filter(t =>
        !t.suitable_personas ||
        t.suitable_personas.length === 0 ||
        t.suitable_personas.includes(criteria.persona_key!)
      );
    }

    // Step 4: Filter by topic compatibility if provided
    if (criteria.topic_key) {
      templates = templates.filter(t =>
        !t.suitable_topics ||
        t.suitable_topics.length === 0 ||
        t.suitable_topics.includes(criteria.topic_key!)
      );
    }

    // Step 5: Sort by quality_threshold (higher first)
    templates.sort((a, b) => (b.quality_threshold || 0) - (a.quality_threshold || 0));

    return templates;
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<PromptTemplate | null> {
    const { data, error } = await this.supabase
      .from('prompt_templates')
      .select('*')
      .eq('id', templateId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data as PromptTemplate;
  }

  /**
   * Validate template compatibility with persona and topic
   */
  async validateCompatibility(
    templateId: string,
    personaKey: string,
    topicKey: string
  ): Promise<{ compatible: boolean; warnings: string[] }> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      return { compatible: false, warnings: ['Template not found'] };
    }

    const warnings: string[] = [];

    // Check persona compatibility
    if (template.suitable_personas && template.suitable_personas.length > 0) {
      if (!template.suitable_personas.includes(personaKey)) {
        warnings.push(`Persona "${personaKey}" not in template's suitable personas list`);
      }
    }

    // Check topic compatibility
    if (template.suitable_topics && template.suitable_topics.length > 0) {
      if (!template.suitable_topics.includes(topicKey)) {
        warnings.push(`Topic "${topicKey}" not in template's suitable topics list`);
      }
    }

    return {
      compatible: warnings.length === 0,
      warnings
    };
  }
}
```

**Task T-3.2: Enhance Template Resolver**

Update `src/lib/services/template-resolver.ts` to resolve all scaffolding variables.

```typescript
export class TemplateResolver {
  async resolveTemplate(
    templateText: string,
    scaffoldingData: {
      persona: Persona;
      emotional_arc: EmotionalArc;
      training_topic: TrainingTopic;
    }
  ): Promise<string> {
    let resolved = templateText;

    // Resolve persona variables
    resolved = resolved.replace(/{{persona_name}}/g, scaffoldingData.persona.name);
    resolved = resolved.replace(/{{persona_archetype}}/g, scaffoldingData.persona.archetype);
    resolved = resolved.replace(/{{persona_demographics}}/g, this.formatDemographics(scaffoldingData.persona.demographics));
    resolved = resolved.replace(/{{persona_financial_background}}/g, scaffoldingData.persona.financial_background || '');
    resolved = resolved.replace(/{{persona_communication_style}}/g, scaffoldingData.persona.communication_style || '');
    resolved = resolved.replace(/{{persona_typical_questions}}/g, this.formatArray(scaffoldingData.persona.typical_questions));
    resolved = resolved.replace(/{{persona_common_concerns}}/g, this.formatArray(scaffoldingData.persona.common_concerns));
    resolved = resolved.replace(/{{persona_language_patterns}}/g, this.formatArray(scaffoldingData.persona.language_patterns));

    // Resolve emotional arc variables
    resolved = resolved.replace(/{{emotional_arc_name}}/g, scaffoldingData.emotional_arc.name);
    resolved = resolved.replace(/{{starting_emotion}}/g, scaffoldingData.emotional_arc.starting_emotion);
    resolved = resolved.replace(/{{starting_intensity_min}}/g, scaffoldingData.emotional_arc.starting_intensity_min.toString());
    resolved = resolved.replace(/{{starting_intensity_max}}/g, scaffoldingData.emotional_arc.starting_intensity_max.toString());
    resolved = resolved.replace(/{{ending_emotion}}/g, scaffoldingData.emotional_arc.ending_emotion);
    resolved = resolved.replace(/{{ending_intensity_min}}/g, scaffoldingData.emotional_arc.ending_intensity_min.toString());
    resolved = resolved.replace(/{{ending_intensity_max}}/g, scaffoldingData.emotional_arc.ending_intensity_max.toString());
    resolved = resolved.replace(/{{typical_turn_count_min}}/g, scaffoldingData.emotional_arc.typical_turn_count_min.toString());
    resolved = resolved.replace(/{{typical_turn_count_max}}/g, scaffoldingData.emotional_arc.typical_turn_count_max.toString());

    // Resolve topic variables
    resolved = resolved.replace(/{{topic_name}}/g, scaffoldingData.training_topic.name);
    resolved = resolved.replace(/{{topic_description}}/g, scaffoldingData.training_topic.description || '');
    resolved = resolved.replace(/{{topic_complexity}}/g, scaffoldingData.training_topic.complexity_level || 'intermediate');
    resolved = resolved.replace(/{{topic_example_questions}}/g, this.formatArray(scaffoldingData.training_topic.typical_question_examples));
    resolved = resolved.replace(/{{topic_key_concepts}}/g, this.formatArray(scaffoldingData.training_topic.key_concepts));

    // Calculate target turn count (use midpoint of range)
    const minTurns = scaffoldingData.emotional_arc.typical_turn_count_min;
    const maxTurns = scaffoldingData.emotional_arc.typical_turn_count_max;
    const targetTurns = Math.ceil((minTurns + maxTurns) / 2);
    resolved = resolved.replace(/{{target_turn_count}}/g, targetTurns.toString());

    return resolved;
  }

  private formatDemographics(demographics: any): string {
    if (!demographics) return '';
    return Object.entries(demographics)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  private formatArray(arr: string[] | null | undefined): string {
    if (!arr || arr.length === 0) return '';
    return arr.map(item => `- ${item}`).join('\n');
  }
}
```

**Task T-3.3: Update /conversations/generate UI Integration**

Connect the template selection service to the UI (stub exists, needs backend integration).

(Include API endpoint updates and UI component enhancements)

**ACCEPTANCE CRITERIA:**

1. **Template Selection Logic**:
   - ✅ Emotional arc is primary selector
   - ✅ Tier filtering works correctly
   - ✅ Persona compatibility validated
   - ✅ Topic compatibility validated
   - ✅ Returns templates sorted by quality_threshold

2. **Template Resolution**:
   - ✅ All persona variables resolved correctly
   - ✅ All emotional arc variables resolved
   - ✅ All topic variables resolved
   - ✅ Arrays formatted as bullet lists
   - ✅ No unresolved {{placeholders}} in output

3. **Integration**:
   - ✅ API endpoint returns templates based on criteria
   - ✅ UI displays emotional arc selector first
   - ✅ UI shows compatible templates based on selections
   - ✅ Compatibility warnings shown when persona/topic mismatch

**VALIDATION REQUIREMENTS:**

1. **Test Template Selection:**
   ```bash
   # Query templates for confusion_to_clarity arc
   node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentQuery({table:'prompt_templates',where:[{column:'emotional_arc_type',operator:'eq',value:'confusion_to_clarity'},{column:'tier',operator:'eq',value:'template'}]});console.log('Templates found:',r.data.length);})();"
   ```

2. **Test Variable Resolution:**
   - Get a template with placeholders
   - Load scaffolding data for a persona, arc, and topic
   - Run template resolver
   - Verify all {{placeholders}} replaced
   - Verify output makes grammatical sense

3. **Integration Test:**
   - Navigate to `/conversations/generate` in UI
   - Select emotional arc "Confusion → Clarity"
   - Verify templates filtered to that arc
   - Select persona and topic
   - Verify compatibility validation works
   - Generate a conversation and verify template used correctly

++++++++++++++++++

---

## Success Criteria

**E01 Segment Complete When:**

1. ✅ All scaffolding tables created and populated
   - 3 personas extracted from seed data
   - 7+ emotional arcs extracted from c-alpha spec
   - 50+ training topics catalogued

2. ✅ All 7 Tier 1 templates extracted and stored
   - Templates preserve Elena Morales methodology
   - Variable placeholders documented
   - Templates linked to emotional arcs

3. ✅ Template selection service operational
   - Emotional arc primary selector implemented
   - Compatibility validation working
   - Variable resolution tested

4. ✅ Integration with UI
   - `/conversations/generate` page functional
   - User can select arc, tier, persona, topic
   - Template selection and generation flow works end-to-end

5. ✅ Quality validation
   - Sample conversations generated
   - Quality scores 4.5+ achieved
   - Elena voice consistency verified

---

**Document Status:** Execution specification ready for implementation
**Total Prompts:** 3
**Sequential Execution Recommended:** Yes
**Estimated Total Time:** 40-60 hours
