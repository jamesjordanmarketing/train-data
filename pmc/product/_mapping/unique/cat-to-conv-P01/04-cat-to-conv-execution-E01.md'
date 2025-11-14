# Categories-to-Conversations Pipeline - Implementation Execution Instructions (E01)

**Generated**: 2025-11-14
**Segment**: E01 - Conversation Scaffolding Implementation
**Total Prompts**: 3
**Estimated Implementation Time**: 40-60 hours
**Specification Sources**:
- `04-categories-to-conversation-strategic-overview_v1.md`
- `04-categories-to-conversation-pipeline-spec_v1.md`
**Functional Requirements**: POC Scope - Short-Term Scaffolding Data Implementation

---

## Executive Summary

The E01 segment implements the complete **Conversation Scaffolding Data System** for the Interactive LoRA Conversation Generation Module, enabling structured persona, emotional arc, and training topic selection to replace the current free-text approach. This transformation enables consistent, high-quality conversation generation aligned with the Elena Morales methodology.

This segment is **strategically critical** because:

1. **Foundation for Quality**: Structured scaffolding data ensures all generated conversations follow proven emotional intelligence patterns
2. **Scalability**: Database-driven approach enables growth from 10 seed conversations to 1000+ variations
3. **Reproducibility**: Scaffolding snapshots provide complete audit trail and regeneration capability
4. **Future Integration**: Lays groundwork for chunk/category mapping and AI-assisted parameter suggestion
5. **Methodology Preservation**: Embeds Elena Morales principles directly in database schema and service layer

**Key Deliverables:**
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

**No Blocking Dependencies**: E01 can be implemented immediately based on current system state.

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

**Prompt 1: Database Foundation & Data Population**
- **Why First**: All other components depend on database tables and seed data
- **Scope**: Create tables, extract seed data, populate database, basic validation
- **Output**: Working database with complete scaffolding data
- **Estimated Time**: 15-20 hours

**Prompt 2: Service Layer & API Integration**
- **Why Second**: Business logic foundation for scaffolding operations
- **Scope**: ScaffoldingDataService, ParameterAssemblyService, TemplateSelectionService, API endpoints
- **Output**: Complete service layer with API endpoints ready for UI integration
- **Estimated Time**: 15-20 hours

**Prompt 3: UI Components & End-to-End Integration**
- **Why Third**: User-facing interface depending on API availability
- **Scope**: ScaffoldingSelector component, /conversations/generate page updates, compatibility UI, testing
- **Output**: Complete scaffolding system with working UI and end-to-end generation
- **Estimated Time**: 10-20 hours

**Independence Strategy**: Each prompt is self-contained with complete context. Prompts 2 and 3 depend on Prompt 1 completion but include validation steps to verify dependencies.

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

## Prompt 1: Database Foundation & Data Population

### Objective

Create the database schema for conversation scaffolding data (personas, emotional_arcs, training_topics tables), extract seed data from specifications, populate tables, and verify data integrity.

### Prerequisites

- Access to `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
- SAOL library available
- Supabase service role key configured

### Context

The train-data application currently uses free-text fields (persona, emotion, topic) in the conversations table. This prompt creates structured scaffolding data tables to replace free-text with dropdown selections, ensuring consistency and enabling methodology-driven conversation generation.

### Acceptance Criteria

1. ✅ Three new tables created: personas, emotional_arcs, training_topics
2. ✅ Foreign key columns added to conversations table: persona_id, emotional_arc_id, training_topic_id, scaffolding_snapshot
3. ✅ Foreign key columns added to prompt_templates table: emotional_arc_id, emotional_arc_type, suitable_personas, suitable_topics
4. ✅ All tables have proper indexes for performance
5. ✅ Seed data extracted and validated from c-alpha-build spec
6. ✅ At least 3 personas, 5 emotional arcs, 10 training topics populated
7. ✅ Data validation confirms all required fields present and types correct

========================


# PROMPT 1: Database Foundation & Data Population

## Task Overview

You are implementing the database foundation for the conversation scaffolding system in the train-data application. This involves creating three new tables (personas, emotional_arcs, training_topics), adding foreign key columns to existing tables, extracting seed data from specifications, and populating the database.

## Critical Instructions

1. **Use SAOL for all database operations**:
   - Library location: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`
   - Quick Start: `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

2. **Read specifications carefully**:
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-pipeline-spec_v1.md` (lines 84-510)
   - Contains complete table schemas with all fields and constraints

3. **Extract seed data from**:
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
   - Cross-reference with seed conversations in `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds/`

4. **Validate all work**:
   - Test table creation with `node src/scripts/cursor-db-helper.js describe [table_name]`
   - Verify data population with `node src/scripts/cursor-db-helper.js query "SELECT * FROM [table] LIMIT 5"`

## Step 1: Create Database Tables

**1.1 Create personas table**

Using the schema from lines 87-147 of the pipeline spec, create the personas table:

```sql
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
  demographics JSONB NOT NULL,

  -- Financial Profile
  financial_background TEXT,
  financial_situation VARCHAR(50),

  -- Personality & Communication
  personality_traits TEXT[],
  communication_style TEXT,
  emotional_baseline VARCHAR(50),
  decision_style VARCHAR(50),

  -- Conversation Behavior Patterns
  typical_questions TEXT[],
  common_concerns TEXT[],
  language_patterns TEXT[],

  -- Usage Metadata
  domain VARCHAR(50) DEFAULT 'financial_planning',
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,

  -- Compatibility
  compatible_arcs TEXT[],
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
CREATE INDEX idx_personas_persona_type ON personas(persona_type);
CREATE INDEX idx_personas_domain ON personas(domain);
CREATE INDEX idx_personas_is_active ON personas(is_active);
CREATE INDEX idx_personas_emotional_baseline ON personas(emotional_baseline);
```

Execute this SQL via SAOL:
```bash
node -e "const saol=require('./supa-agent-ops');(async()=>{const r=await saol.agentExecuteDDL({sql:'[PASTE SQL HERE]',transport:'pg'});console.log(r);})();"
```

**1.2 Create emotional_arcs table**

Using schema from lines 200-278 of pipeline spec:

```sql
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
  secondary_starting_emotions TEXT[],

  midpoint_emotion VARCHAR(50),
  midpoint_intensity NUMERIC(3,2),

  ending_emotion VARCHAR(50) NOT NULL,
  ending_intensity_min NUMERIC(3,2),
  ending_intensity_max NUMERIC(3,2),
  secondary_ending_emotions TEXT[],

  -- Structural Pattern
  turn_structure JSONB,
  conversation_phases TEXT[],

  -- Response Strategy Guidance
  primary_strategy VARCHAR(100),
  response_techniques TEXT[],
  avoid_tactics TEXT[],

  -- Elena Morales Principles Applied
  key_principles TEXT[],

  -- Communication Patterns
  characteristic_phrases TEXT[],
  opening_templates TEXT[],
  closing_templates TEXT[],

  -- Usage Metadata
  tier_suitability TEXT[],
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
CREATE INDEX idx_emotional_arcs_arc_type ON emotional_arcs(arc_type);
CREATE INDEX idx_emotional_arcs_domain ON emotional_arcs(domain);
CREATE INDEX idx_emotional_arcs_is_active ON emotional_arcs(is_active);
CREATE INDEX idx_emotional_arcs_starting_emotion ON emotional_arcs(starting_emotion);
```

Execute via SAOL.

**1.3 Create training_topics table**

Using schema from lines 360-420 of pipeline spec:

```sql
CREATE TABLE IF NOT EXISTS training_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(200) NOT NULL,
  topic_key VARCHAR(100) NOT NULL,
  category VARCHAR(100),

  -- Description
  description TEXT NOT NULL,
  typical_question_examples TEXT[],

  -- Classification
  domain VARCHAR(50) DEFAULT 'financial_planning',
  content_category VARCHAR(100),
  complexity_level VARCHAR(20),

  -- Context Requirements
  requires_numbers BOOLEAN DEFAULT false,
  requires_timeframe BOOLEAN DEFAULT false,
  requires_personal_context BOOLEAN DEFAULT false,

  -- Suitability
  suitable_personas TEXT[],
  suitable_arcs TEXT[],
  suitable_tiers TEXT[],

  -- Metadata
  tags TEXT[],
  related_topics TEXT[],

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
CREATE INDEX idx_training_topics_topic_key ON training_topics(topic_key);
CREATE INDEX idx_training_topics_domain ON training_topics(domain);
CREATE INDEX idx_training_topics_category ON training_topics(category);
CREATE INDEX idx_training_topics_complexity ON training_topics(complexity_level);
CREATE INDEX idx_training_topics_is_active ON training_topics(is_active);
```

Execute via SAOL.

**1.4 Alter conversations table to add scaffolding foreign keys**

```sql
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
```

Execute via SAOL.

**1.5 Alter prompt_templates table to add emotional arc integration**

```sql
-- Add emotional arc integration to prompt_templates table
ALTER TABLE prompt_templates
  ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
  ADD COLUMN IF NOT EXISTS emotional_arc_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS suitable_personas TEXT[],
  ADD COLUMN IF NOT EXISTS suitable_topics TEXT[],
  ADD COLUMN IF NOT EXISTS methodology_principles TEXT[];

-- Add indexes for emotional arc queries
CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc_id ON prompt_templates(emotional_arc_id);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc_type ON prompt_templates(emotional_arc_type);
```

Execute via SAOL.

## Step 2: Extract Seed Data from Specifications

**2.1 Read the c-alpha-build specification**

Read the complete specification:
```bash
cat "C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md"
```

Look for:
- Persona definitions (search for "Marcus-type", "Jennifer-type", "David-type")
- Emotional arc patterns (search for "Template A", "Template B", "Template C")
- Training topics (search for "HSA", "Roth IRA", "RMD")
- Response strategies (search for "Elena Morales methodology")

**2.2 Create seed data structures**

Create a file `src/scripts/scaffolding-seed-data.ts` with the extracted data:

```typescript
export const PERSONAS_SEED = [
  {
    name: "Marcus-type: Overwhelmed Avoider",
    persona_type: "overwhelmed_avoider",
    short_name: "Marcus",
    description: "Mid-30s tech worker who has avoided financial planning despite high income. Recently promoted with equity compensation but feels shame about not understanding basics. Tends to procrastinate on financial decisions.",
    archetype_summary: "High-earning tech professional overwhelmed by financial complexity and ashamed of knowledge gaps.",
    demographics: {
      age_range: "35-40",
      career: "tech worker / software engineer",
      income_range: "$120K-160K",
      family_status: "single or married no kids",
      education: "bachelor's or master's in technical field"
    },
    financial_background: "Promoted to senior engineer, received RSUs, 401k with company match but never adjusted allocations, some credit card debt from lifestyle inflation, no emergency fund despite high income.",
    financial_situation: "high_earner_low_financial_literacy",
    personality_traits: ["avoidant", "overwhelmed", "shame-prone", "delayed action", "perfectionistic"],
    communication_style: "Brief questions, self-deprecating language, seeks reassurance, apologizes for not knowing, delayed responses",
    emotional_baseline: "overwhelmed",
    decision_style: "avoidant",
    typical_questions: [
      "I got promoted and got RSUs but have no idea what that means",
      "This might sound stupid, but what's a Roth IRA?",
      "Everyone at work talks about backdoor Roths and I just nod along",
      "I'm 38 and have barely anything saved for retirement - is it too late?"
    ],
    common_concerns: [
      "Being judged for not knowing basics",
      "Making mistakes with money",
      "Feeling behind peers financially",
      "Complexity of financial concepts",
      "Not having enough time to learn"
    ],
    language_patterns: [
      "This might sound stupid, but...",
      "I should have done this years ago",
      "Everyone else seems to understand this",
      "I just need someone to tell me what to do",
      "This is probably a dumb question"
    ],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    compatible_arcs: ["confusion_to_clarity", "shame_to_acceptance", "overwhelm_to_empowerment"],
    complexity_preference: "simple"
  },
  // ADD MORE PERSONAS from spec (Jennifer-type, David-type, etc.)
  // Extract from c-alpha-build spec
];

export const EMOTIONAL_ARCS_SEED = [
  {
    name: "Confusion → Clarity",
    arc_type: "confusion_to_clarity",
    category: "educational",
    description: "Guides clients from genuine confusion about financial concepts to clear understanding through judgment-free education. Most common arc for complex financial topics.",
    when_to_use: "When client expresses confusion about financial concepts, shows decision paralysis from complexity, or uses self-deprecating language about not understanding. Ideal for educational conversations about complex topics.",
    starting_emotion: "confusion",
    starting_intensity_min: 0.70,
    starting_intensity_max: 0.85,
    secondary_starting_emotions: ["embarrassment", "overwhelm", "uncertainty"],
    midpoint_emotion: "recognition",
    midpoint_intensity: 0.65,
    ending_emotion: "clarity",
    ending_intensity_min: 0.70,
    ending_intensity_max: 0.80,
    secondary_ending_emotions: ["confidence", "empowerment", "relief"],
    turn_structure: {
      typical_turns: "3-5",
      turn_1: "User expresses confusion about concept, often with self-deprecation",
      turn_2: "User provides details, shows slight relief at normalization",
      turn_3_4: "User asks follow-up questions, shows growing understanding",
      turn_5: "User expresses clarity and readiness to act (if applicable)"
    },
    conversation_phases: [
      "confusion_expression",
      "normalization_and_reframe",
      "education_and_breakdown",
      "understanding_confirmation",
      "clarity_celebration"
    ],
    primary_strategy: "normalize_confusion_then_educate",
    response_techniques: [
      "explicit_normalization (this is incredibly common)",
      "reframe_to_positive (you're asking exactly the right question)",
      "break_complexity_into_simple_steps",
      "use_concrete_numbers",
      "ask_permission_to_educate",
      "celebrate_understanding_progress"
    ],
    avoid_tactics: [
      "rush_to_solutions_before_validation",
      "minimize_confusion (it's not that complicated)",
      "use_jargon_without_explanation",
      "assume_prior_knowledge"
    ],
    key_principles: [
      "judgment_free_space",
      "education_first",
      "progress_over_perfection"
    ],
    characteristic_phrases: [
      "I can hear the confusion in your question",
      "This is incredibly common - you're not alone",
      "Let's break this down simply",
      "Would it be helpful if I explained...",
      "You're asking exactly the right question",
      "Does that make sense?"
    ],
    opening_templates: [
      "First, {normalize_shame_statement}. {financial_concept} is genuinely {complexity_acknowledgment}.",
      "I can hear the {detected_emotion} in your question - that's completely {validation}. Let me break down {topic} in a way that makes sense."
    ],
    closing_templates: [
      "Does that help clarify things? You went from {starting_state} to {clear_understanding} - that's real progress.",
      "You're asking all the right questions now. {next_step_invitation}."
    ],
    tier_suitability: ["template", "scenario"],
    domain: "financial_planning",
    is_active: true,
    usage_count: 0,
    typical_turn_count_min: 3,
    typical_turn_count_max: 5,
    complexity_level: "moderate"
  },
  // ADD MORE ARCS from spec (Shame→Acceptance, Couple Conflict→Alignment, etc.)
  // Extract from c-alpha-build spec
];

export const TRAINING_TOPICS_SEED = [
  {
    name: "HSA vs FSA Decision Paralysis",
    topic_key: "hsa_vs_fsa_decision",
    category: "healthcare_accounts",
    description: "Client confusion about choosing between Health Savings Account (HSA) and Flexible Spending Account (FSA). Common confusion points: eligibility requirements, tax advantages, contribution limits, rollover rules, investment options.",
    typical_question_examples: [
      "What's the difference between an HSA and FSA?",
      "My employer offers both - which should I choose?",
      "Can I have both an HSA and FSA at the same time?",
      "I don't understand the tax benefits - which is better?",
      "What happens to FSA money at the end of the year?"
    ],
    domain: "financial_planning",
    content_category: "healthcare_and_benefits",
    complexity_level: "intermediate",
    requires_numbers: true,
    requires_timeframe: false,
    requires_personal_context: true,
    suitable_personas: ["overwhelmed_avoider", "anxious_planner"],
    suitable_arcs: ["confusion_to_clarity", "overwhelm_to_empowerment"],
    suitable_tiers: ["template", "scenario"],
    tags: ["tax_advantaged", "healthcare", "decision_making", "employee_benefits"],
    related_topics: ["high_deductible_health_plan", "healthcare_budgeting"],
    is_active: true,
    usage_count: 0,
    priority: "normal"
  },
  // ADD MORE TOPICS from spec (Roth IRA conversion, RMDs, backdoor Roth, etc.)
  // Extract from c-alpha-build spec
];
```

**IMPORTANT**: Extract the actual data from the c-alpha-build spec. The examples above are templates. You must fill in all personas, arcs, and topics from the specification.

**2.3 Validate extracted data against seed conversations**

Read 2-3 seed conversations:
```bash
ls "C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds/"
```

Verify that:
- Personas mentioned in PERSONAS_SEED actually appear in seed conversations
- Emotional arc patterns match conversation structure
- Topics listed exist in actual conversations

## Step 3: Populate Database with Seed Data

**3.1 Create population script**

Create `src/scripts/populate-scaffolding-data.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { PERSONAS_SEED, EMOTIONAL_ARCS_SEED, TRAINING_TOPICS_SEED } from './scaffolding-seed-data';

async function populateScaffoldingData() {
  const supabase = createClient();

  console.log('Starting scaffolding data population...');

  // 1. Populate personas
  console.log('\n1. Populating personas...');
  for (const persona of PERSONAS_SEED) {
    const { error } = await supabase
      .from('personas')
      .upsert(persona, { onConflict: 'persona_type,domain' });

    if (error) {
      console.error(`Failed to insert persona ${persona.persona_type}:`, error);
    } else {
      console.log(`✓ Inserted persona: ${persona.name}`);
    }
  }

  // 2. Populate emotional arcs
  console.log('\n2. Populating emotional arcs...');
  for (const arc of EMOTIONAL_ARCS_SEED) {
    const { error } = await supabase
      .from('emotional_arcs')
      .upsert(arc, { onConflict: 'arc_type' });

    if (error) {
      console.error(`Failed to insert arc ${arc.arc_type}:`, error);
    } else {
      console.log(`✓ Inserted arc: ${arc.name}`);
    }
  }

  // 3. Populate training topics
  console.log('\n3. Populating training topics...');
  for (const topic of TRAINING_TOPICS_SEED) {
    const { error } = await supabase
      .from('training_topics')
      .upsert(topic, { onConflict: 'topic_key,domain' });

    if (error) {
      console.error(`Failed to insert topic ${topic.topic_key}:`, error);
    } else {
      console.log(`✓ Inserted topic: ${topic.name}`);
    }
  }

  console.log('\n✅ Scaffolding data population complete!');

  // 4. Verify counts
  const { count: personaCount } = await supabase.from('personas').select('*', { count: 'exact', head: true });
  const { count: arcCount } = await supabase.from('emotional_arcs').select('*', { count: 'exact', head: true });
  const { count: topicCount } = await supabase.from('training_topics').select('*', { count: 'exact', head: true });

  console.log(`\nFinal counts:`);
  console.log(`- Personas: ${personaCount}`);
  console.log(`- Emotional Arcs: ${arcCount}`);
  console.log(`- Training Topics: ${topicCount}`);
}

// Run if executed directly
populateScaffoldingData().catch(console.error);
```

**3.2 Execute population script**

```bash
npx tsx src/scripts/populate-scaffolding-data.ts
```

Expected output:
```
Starting scaffolding data population...

1. Populating personas...
✓ Inserted persona: Marcus-type: Overwhelmed Avoider
✓ Inserted persona: Jennifer-type: Anxious Planner
✓ Inserted persona: David-type: Pragmatic Optimist

2. Populating emotional arcs...
✓ Inserted arc: Confusion → Clarity
✓ Inserted arc: Shame → Acceptance
✓ Inserted arc: Couple Conflict → Alignment
✓ Inserted arc: Fear → Confidence
✓ Inserted arc: Overwhelm → Empowerment

3. Populating training topics...
✓ Inserted topic: HSA vs FSA Decision Paralysis
✓ Inserted topic: Roth IRA Conversion Confusion
[... more topics]

✅ Scaffolding data population complete!

Final counts:
- Personas: 3
- Emotional Arcs: 5
- Training Topics: 12
```

## Step 4: Validate Database State

**4.1 Verify table creation**

```bash
node src/scripts/cursor-db-helper.js list-tables | grep -E "(personas|emotional_arcs|training_topics)"
```

Expected: All three tables appear in list.

**4.2 Verify personas data**

```bash
node src/scripts/cursor-db-helper.js query "SELECT name, persona_type, emotional_baseline, compatible_arcs FROM personas ORDER BY name"
```

Expected: 3+ personas with complete data.

**4.3 Verify emotional_arcs data**

```bash
node src/scripts/cursor-db-helper.js query "SELECT name, arc_type, starting_emotion, ending_emotion, tier_suitability FROM emotional_arcs ORDER BY name"
```

Expected: 5+ arcs with complete data.

**4.4 Verify training_topics data**

```bash
node src/scripts/cursor-db-helper.js query "SELECT name, topic_key, complexity_level, suitable_personas FROM training_topics ORDER BY name LIMIT 10"
```

Expected: 10+ topics with complete data.

**4.5 Verify foreign keys added to conversations table**

```bash
node src/scripts/cursor-db-helper.js describe conversations | grep -E "(persona_id|emotional_arc_id|training_topic_id|scaffolding_snapshot)"
```

Expected: All four columns present.

**4.6 Verify foreign keys added to prompt_templates table**

```bash
node src/scripts/cursor-db-helper.js describe prompt_templates | grep -E "(emotional_arc_id|emotional_arc_type|suitable_personas|suitable_topics)"
```

Expected: All five columns present.

## Step 5: Test Data Integrity

**5.1 Test persona insertion**

Try inserting a test persona:
```bash
node -e "const {createClient}=require('@/lib/supabase/server');(async()=>{const s=createClient();const r=await s.from('personas').insert({name:'Test Persona',persona_type:'test_type',short_name:'Test',description:'Test',demographics:{},personality_traits:[],typical_questions:[],common_concerns:[],language_patterns:[],compatible_arcs:[]});console.log(r);})();"
```

Expected: Successful insertion or unique constraint violation (if test_type already exists).

**5.2 Test foreign key constraint**

Try inserting a conversation with invalid persona_id:
```bash
node -e "const {createClient}=require('@/lib/supabase/server');(async()=>{const s=createClient();const r=await s.from('conversations').insert({persona_id:'00000000-0000-0000-0000-000000000000',title:'Test'});console.log(r);})();"
```

Expected: Foreign key constraint violation error.

**5.3 Clean up test data**

```bash
node -e "const {createClient}=require('@/lib/supabase/server');(async()=>{const s=createClient();await s.from('personas').delete().eq('persona_type','test_type');console.log('Cleaned up test persona');})();"
```

## Acceptance Checklist

Before moving to Prompt 2, verify:

- [ ] personas table created with all columns and indexes
- [ ] emotional_arcs table created with all columns and indexes
- [ ] training_topics table created with all columns and indexes
- [ ] conversations table has persona_id, emotional_arc_id, training_topic_id, scaffolding_snapshot columns
- [ ] prompt_templates table has emotional_arc_id, emotional_arc_type, suitable_personas, suitable_topics columns
- [ ] At least 3 personas populated with complete data
- [ ] At least 5 emotional arcs populated with complete data
- [ ] At least 10 training topics populated with complete data
- [ ] All personas have valid emotional_baseline values
- [ ] All emotional arcs have valid intensity ranges (0-1)
- [ ] All training topics have valid complexity_level values ('basic', 'intermediate', 'advanced')
- [ ] Foreign key constraints work (tested with invalid IDs)
- [ ] Data cross-validated against c-alpha-build spec and seed conversations

## Troubleshooting

**Issue**: Table creation fails with "permission denied"
**Solution**: Verify you're using SERVICE_ROLE_KEY, not anon key. Check environment variables.

**Issue**: Population script fails with "relation does not exist"
**Solution**: Verify tables were created successfully. Run `list-tables` command to check.

**Issue**: Seed data extraction incomplete
**Solution**: Re-read c-alpha-build spec carefully. Search for keywords: "Marcus", "Template A", "HSA", "Elena Morales". Cross-reference with seed conversation files.

**Issue**: Foreign key constraint violations during population
**Solution**: Check that persona_type, arc_type, and topic_key values are unique. Verify upsert conflicts match unique constraints.

## Next Steps

Once this prompt is complete and all acceptance criteria are met, proceed to **Prompt 2: Service Layer & API Integration**.


+++++++++++++++++




---

## Prompt 2: Service Layer & API Integration

### Objective

Create the service layer for scaffolding data operations (ScaffoldingDataService, ParameterAssemblyService, TemplateSelectionService) and build API endpoints for scaffolding data retrieval and scaffolding-integrated conversation generation.

### Prerequisites

- Prompt 1 completed successfully
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

========================


# PROMPT 2: Service Layer & API Integration

## Task Overview

You are implementing the service layer and API endpoints for the conversation scaffolding system. This involves creating three service classes (ScaffoldingDataService, ParameterAssemblyService, TemplateSelectionService) and five API endpoints to support scaffolding-based conversation generation.

## Critical Instructions

1. **Follow existing service patterns**:
   - Reference: `src/lib/services/conversation-service.ts`
   - Reference: `src/lib/services/template-service.ts`
   - Use class-based services with Supabase client injection

2. **Follow existing API patterns**:
   - Reference: `src/app/api/conversations/generate/route.ts`
   - Use Next.js 14 App Router conventions
   - Proper error handling with try-catch
   - JSON response formatting

3. **Refer to specification for complete interfaces**:
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-pipeline-spec_v1.md`
   - Lines 514-1120: Complete service specifications
   - Lines 1122-1279: Complete API endpoint specifications

4. **Test all endpoints**:
   - Use curl or Postman to test API responses
   - Verify type correctness with TypeScript compilation
   - Check error handling with invalid inputs

## Step 1: Create TypeScript Types for Scaffolding Data

**1.1 Create scaffolding types file**

Create `src/lib/types/scaffolding.types.ts`:

```typescript
/**
 * Type Definitions for Conversation Scaffolding Data
 * Matches database schema for personas, emotional_arcs, training_topics
 */

export interface Persona {
  id: string;
  name: string;
  persona_type: string;
  short_name: string;
  description: string;
  archetype_summary?: string;
  demographics: Record<string, any>;
  financial_background?: string;
  financial_situation?: string;
  personality_traits: string[];
  communication_style?: string;
  emotional_baseline: string;
  decision_style?: string;
  typical_questions: string[];
  common_concerns: string[];
  language_patterns: string[];
  domain: string;
  is_active: boolean;
  usage_count: number;
  compatible_arcs: string[];
  complexity_preference?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmotionalArc {
  id: string;
  name: string;
  arc_type: string;
  category?: string;
  description: string;
  when_to_use?: string;
  starting_emotion: string;
  starting_intensity_min: number;
  starting_intensity_max: number;
  secondary_starting_emotions: string[];
  midpoint_emotion?: string;
  midpoint_intensity?: number;
  ending_emotion: string;
  ending_intensity_min: number;
  ending_intensity_max: number;
  secondary_ending_emotions: string[];
  turn_structure: Record<string, any>;
  conversation_phases: string[];
  primary_strategy: string;
  response_techniques: string[];
  avoid_tactics: string[];
  key_principles: string[];
  characteristic_phrases: string[];
  opening_templates: string[];
  closing_templates: string[];
  tier_suitability: string[];
  domain: string;
  is_active: boolean;
  usage_count: number;
  typical_turn_count_min?: number;
  typical_turn_count_max?: number;
  complexity_level?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TrainingTopic {
  id: string;
  name: string;
  topic_key: string;
  category?: string;
  description: string;
  typical_question_examples: string[];
  domain: string;
  content_category?: string;
  complexity_level: string;
  requires_numbers: boolean;
  requires_timeframe: boolean;
  requires_personal_context: boolean;
  suitable_personas: string[];
  suitable_arcs: string[];
  suitable_tiers: string[];
  tags: string[];
  related_topics: string[];
  is_active: boolean;
  usage_count: number;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CompatibilityResult {
  is_compatible: boolean;
  warnings: string[];
  suggestions: string[];
  confidence: number; // 0-1
}

export interface ConversationParameters {
  persona: Persona;
  emotional_arc: EmotionalArc;
  training_topic: TrainingTopic;
  tier: 'template' | 'scenario' | 'edge_case';
  template_id?: string;
  temperature?: number;
  max_tokens?: number;
  target_turn_count?: number;
  chunk_id?: string;
  chunk_context?: string;
  document_id?: string;
  created_by?: string;
  generation_mode: 'manual' | 'chunk_based' | 'batch';
}

export interface AssembledParameters {
  conversation_params: ConversationParameters;
  template_variables: Record<string, any>;
  system_prompt: string;
  metadata: {
    compatibility_score: number;
    warnings: string[];
    suggestions: string[];
  };
}

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface TemplateSelectionCriteria {
  emotional_arc_type: string;
  tier: 'template' | 'scenario' | 'edge_case';
  persona_type?: string;
  topic_key?: string;
}

export interface TemplateSelectionResult {
  template_id: string;
  template_name: string;
  confidence_score: number;
  rationale: string;
  alternatives: Array<{
    template_id: string;
    template_name: string;
    confidence_score: number;
  }>;
}
```

## Step 2: Create ScaffoldingDataService

**2.1 Create service file**

Create `src/lib/services/scaffolding-data-service.ts`:

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import {
  Persona,
  EmotionalArc,
  TrainingTopic,
  CompatibilityResult
} from '@/lib/types/scaffolding.types';

export class ScaffoldingDataService {
  constructor(private supabase: SupabaseClient) {}

  // ============================================================================
  // Persona Operations
  // ============================================================================

  async getAllPersonas(filters?: {
    domain?: string;
    is_active?: boolean;
    emotional_baseline?: string;
  }): Promise<Persona[]> {
    let query = this.supabase.from('personas').select('*');

    if (filters?.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.emotional_baseline) {
      query = query.eq('emotional_baseline', filters.emotional_baseline);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch personas: ${error.message}`);
    }

    return data || [];
  }

  async getPersonaById(id: string): Promise<Persona | null> {
    const { data, error } = await this.supabase
      .from('personas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Failed to fetch persona: ${error.message}`);
    }

    return data;
  }

  async getPersonaByType(persona_type: string, domain = 'financial_planning'): Promise<Persona | null> {
    const { data, error } = await this.supabase
      .from('personas')
      .select('*')
      .eq('persona_type', persona_type)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch persona by type: ${error.message}`);
    }

    return data;
  }

  async incrementPersonaUsage(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_persona_usage', { persona_id: id });

    if (error) {
      console.error(`Failed to increment persona usage: ${error.message}`);
    }
  }

  // ============================================================================
  // Emotional Arc Operations
  // ============================================================================

  async getAllEmotionalArcs(filters?: {
    domain?: string;
    is_active?: boolean;
    category?: string;
  }): Promise<EmotionalArc[]> {
    let query = this.supabase.from('emotional_arcs').select('*');

    if (filters?.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch emotional arcs: ${error.message}`);
    }

    return data || [];
  }

  async getEmotionalArcById(id: string): Promise<EmotionalArc | null> {
    const { data, error } = await this.supabase
      .from('emotional_arcs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch emotional arc: ${error.message}`);
    }

    return data;
  }

  async getEmotionalArcByType(arc_type: string, domain = 'financial_planning'): Promise<EmotionalArc | null> {
    const { data, error } = await this.supabase
      .from('emotional_arcs')
      .select('*')
      .eq('arc_type', arc_type)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch emotional arc by type: ${error.message}`);
    }

    return data;
  }

  async incrementArcUsage(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_arc_usage', { arc_id: id });

    if (error) {
      console.error(`Failed to increment arc usage: ${error.message}`);
    }
  }

  // ============================================================================
  // Training Topic Operations
  // ============================================================================

  async getAllTrainingTopics(filters?: {
    domain?: string;
    is_active?: boolean;
    category?: string;
    complexity_level?: string;
  }): Promise<TrainingTopic[]> {
    let query = this.supabase.from('training_topics').select('*');

    if (filters?.domain) {
      query = query.eq('domain', filters.domain);
    }
    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.complexity_level) {
      query = query.eq('complexity_level', filters.complexity_level);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new Error(`Failed to fetch training topics: ${error.message}`);
    }

    return data || [];
  }

  async getTrainingTopicById(id: string): Promise<TrainingTopic | null> {
    const { data, error } = await this.supabase
      .from('training_topics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch training topic: ${error.message}`);
    }

    return data;
  }

  async getTrainingTopicByKey(topic_key: string, domain = 'financial_planning'): Promise<TrainingTopic | null> {
    const { data, error } = await this.supabase
      .from('training_topics')
      .select('*')
      .eq('topic_key', topic_key)
      .eq('domain', domain)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Failed to fetch training topic by key: ${error.message}`);
    }

    return data;
  }

  async incrementTopicUsage(id: string): Promise<void> {
    const { error } = await this.supabase.rpc('increment_topic_usage', { topic_id: id });

    if (error) {
      console.error(`Failed to increment topic usage: ${error.message}`);
    }
  }

  // ============================================================================
  // Compatibility Checking
  // ============================================================================

  async checkCompatibility(params: {
    persona_id: string;
    arc_id: string;
    topic_id: string;
  }): Promise<CompatibilityResult> {
    const [persona, arc, topic] = await Promise.all([
      this.getPersonaById(params.persona_id),
      this.getEmotionalArcById(params.arc_id),
      this.getTrainingTopicById(params.topic_id)
    ]);

    if (!persona || !arc || !topic) {
      return {
        is_compatible: false,
        warnings: ['One or more scaffolding entities not found'],
        suggestions: [],
        confidence: 0
      };
    }

    const warnings: string[] = [];
    const suggestions: string[] = [];
    let confidence = 1.0;

    // Check persona-arc compatibility
    if (persona.compatible_arcs.length > 0 && !persona.compatible_arcs.includes(arc.arc_type)) {
      warnings.push(`Persona "${persona.short_name}" typically doesn't use the ${arc.name} arc. This may still work, but consider alternative arcs.`);
      confidence -= 0.2;
    }

    // Check arc-topic suitability
    if (topic.suitable_arcs.length > 0 && !topic.suitable_arcs.includes(arc.arc_type)) {
      warnings.push(`Topic "${topic.name}" is not typically paired with ${arc.name}. Consider alternative topics or arcs.`);
      confidence -= 0.2;
    }

    // Check persona-topic suitability
    if (topic.suitable_personas.length > 0 && !topic.suitable_personas.includes(persona.persona_type)) {
      warnings.push(`Persona "${persona.short_name}" typically doesn't ask about ${topic.name}. Consider if this combination makes sense for your use case.`);
      confidence -= 0.15;
    }

    // Check complexity alignment
    if (persona.complexity_preference === 'simple' && topic.complexity_level === 'advanced') {
      warnings.push(`Persona prefers simple topics, but "${topic.name}" is advanced. This may create an unrealistic conversation.`);
      confidence -= 0.1;
    }

    // Generate suggestions based on warnings
    if (warnings.length > 0) {
      suggestions.push('Review the compatibility warnings and consider alternative combinations.');

      if (persona.compatible_arcs.length > 0) {
        suggestions.push(`Consider using one of ${persona.short_name}'s compatible arcs: ${persona.compatible_arcs.slice(0, 3).join(', ')}`);
      }
    }

    return {
      is_compatible: confidence > 0.3,
      warnings,
      suggestions,
      confidence: Math.max(0, confidence)
    };
  }
}

// RPC functions for usage increment (need to be created in Supabase)
// These can be simple UPDATE statements wrapped in functions
```

**2.2 Create RPC functions in Supabase**

Execute these SQL functions via SAOL:

```sql
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
```

## Step 3: Create ParameterAssemblyService and TemplateSelectionService

Due to length constraints, refer to the specification document lines 682-1120 for complete implementation details of:

- **ParameterAssemblyService**: Assembles conversation parameters, validates compatibility, builds template variables, constructs system prompts
- **TemplateSelectionService**: Selects templates based on emotional arc + tier, ranks options by confidence

Follow the same patterns as ScaffoldingDataService above. Key methods:

ParameterAssemblyService:
- `assembleParameters(input)`: Main orchestration method
- `validateParameters(params)`: Compatibility validation
- `buildTemplateVariables(params)`: Variable extraction
- `constructSystemPrompt(params)`: Elena Morales system prompt builder

TemplateSelectionService:
- `selectTemplate(criteria)`: Primary selection method
- `selectTemplateWithRationale(criteria)`: With explanation
- `getRankedTemplates(criteria)`: All options ranked

## Step 4: Create API Endpoints

**4.1 GET /api/scaffolding/personas**

Create `src/app/api/scaffolding/personas/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const service = new ScaffoldingDataService(supabase);

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'financial_planning';
    const is_active = searchParams.get('is_active') !== 'false';

    const personas = await service.getAllPersonas({ domain, is_active });

    return NextResponse.json({
      success: true,
      personas,
      count: personas.length
    });
  } catch (error) {
    console.error('Failed to fetch personas:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
```

**4.2 GET /api/scaffolding/emotional-arcs**

Create `src/app/api/scaffolding/emotional-arcs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const service = new ScaffoldingDataService(supabase);

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'financial_planning';
    const is_active = searchParams.get('is_active') !== 'false';
    const category = searchParams.get('category') || undefined;

    const emotional_arcs = await service.getAllEmotionalArcs({ domain, is_active, category });

    return NextResponse.json({
      success: true,
      emotional_arcs,
      count: emotional_arcs.length
    });
  } catch (error) {
    console.error('Failed to fetch emotional arcs:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
```

**4.3 GET /api/scaffolding/training-topics**

Create `src/app/api/scaffolding/training-topics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const service = new ScaffoldingDataService(supabase);

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain') || 'financial_planning';
    const is_active = searchParams.get('is_active') !== 'false';
    const complexity_level = searchParams.get('complexity_level') || undefined;
    const category = searchParams.get('category') || undefined;

    const training_topics = await service.getAllTrainingTopics({
      domain,
      is_active,
      complexity_level,
      category
    });

    return NextResponse.json({
      success: true,
      training_topics,
      count: training_topics.length
    });
  } catch (error) {
    console.error('Failed to fetch training topics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
```

**4.4 POST /api/scaffolding/check-compatibility**

Create `src/app/api/scaffolding/check-compatibility/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { persona_id, emotional_arc_id, training_topic_id } = body;

    if (!persona_id || !emotional_arc_id || !training_topic_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const service = new ScaffoldingDataService(supabase);

    const result = await service.checkCompatibility({
      persona_id,
      arc_id: emotional_arc_id,
      topic_id: training_topic_id
    });

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Compatibility check failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
```

**4.5 POST /api/conversations/generate-with-scaffolding**

Refer to specification lines 1126-1279 for complete implementation. Key structure:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';
import { ParameterAssemblyService } from '@/lib/services/parameter-assembly-service';
import { TemplateSelectionService } from '@/lib/services/template-selection-service';
import { ConversationGenerator } from '@/lib/generation/conversation-generator';

export const maxDuration = 300; // 5 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse request
    const body = await request.json();
    const { persona_id, emotional_arc_id, training_topic_id, tier } = body;

    // 2. Validate required fields
    if (!persona_id || !emotional_arc_id || !training_topic_id || !tier) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 3. Initialize services
    const supabase = createClient();
    const scaffoldingService = new ScaffoldingDataService(supabase);
    const templateSelectionService = new TemplateSelectionService(supabase);
    const parameterAssemblyService = new ParameterAssemblyService(
      scaffoldingService,
      templateSelectionService
    );

    // 4. Assemble parameters
    const assembled = await parameterAssemblyService.assembleParameters({
      persona_id,
      emotional_arc_id,
      training_topic_id,
      tier
    });

    // 5. Generate conversation (integrate with existing conversation-generator)
    // ... (see specification for details)

    // 6. Update conversation with scaffolding provenance
    // ... (see specification for details)

    // 7. Return success response
    return NextResponse.json({
      success: true,
      conversation_id: conversation.id,
      // ... (see specification for details)
    });

  } catch (error) {
    console.error('Conversation generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
```

## Step 5: Test API Endpoints

**5.1 Test personas endpoint**

```bash
curl http://localhost:3000/api/scaffolding/personas
```

Expected: JSON with personas array.

**5.2 Test emotional-arcs endpoint**

```bash
curl http://localhost:3000/api/scaffolding/emotional-arcs
```

Expected: JSON with emotional_arcs array.

**5.3 Test training-topics endpoint**

```bash
curl http://localhost:3000/api/scaffolding/training-topics
```

Expected: JSON with training_topics array.

**5.4 Test compatibility check**

```bash
curl -X POST http://localhost:3000/api/scaffolding/check-compatibility \
  -H "Content-Type: application/json" \
  -d '{"persona_id":"<persona-id>","emotional_arc_id":"<arc-id>","training_topic_id":"<topic-id>"}'
```

Expected: JSON with is_compatible, warnings, suggestions, confidence.

## Acceptance Checklist

Before moving to Prompt 3, verify:

- [ ] ScaffoldingDataService created with all CRUD methods
- [ ] ParameterAssemblyService created with assembly logic
- [ ] TemplateSelectionService created with selection logic
- [ ] Types file created with all interfaces
- [ ] GET /api/scaffolding/personas returns personas
- [ ] GET /api/scaffolding/emotional-arcs returns arcs
- [ ] GET /api/scaffolding/training-topics returns topics
- [ ] POST /api/scaffolding/check-compatibility validates combinations
- [ ] POST /api/conversations/generate-with-scaffolding generates conversations
- [ ] All services handle errors gracefully
- [ ] TypeScript compilation succeeds with no errors
- [ ] API endpoints tested manually with curl/Postman

## Troubleshooting

**Issue**: Service methods throw "Cannot read property of undefined"
**Solution**: Ensure database tables are populated. Check Prompt 1 completion status.

**Issue**: API endpoints return 404
**Solution**: Verify file paths match Next.js 14 App Router conventions. Check that files are in `src/app/api/` directory.

**Issue**: Template selection fails
**Solution**: Verify prompt_templates table has emotional_arc_type column and some templates are linked to arcs.

## Next Steps

Once this prompt is complete and all acceptance criteria are met, proceed to **Prompt 3: UI Components & End-to-End Integration**.


+++++++++++++++++




---

## Prompt 3: UI Components & End-to-End Integration

### Objective

Create UI components for scaffolding selection (ScaffoldingSelector) and integrate them into the /conversations/generate page. Implement compatibility warnings, enable end-to-end conversation generation with scaffolding data, and validate the complete system.

### Prerequisites

- Prompt 1 and Prompt 2 completed successfully
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

========================


# PROMPT 3: UI Components & End-to-End Integration

## Task Overview

You are implementing the UI components for scaffolding selection and integrating them into the conversation generation workflow. This involves creating the ScaffoldingSelector component, updating the /conversations/generate page, adding compatibility warnings, and testing the complete end-to-end flow.

## Critical Instructions

1. **Follow existing UI patterns**:
   - Reference: `src/components/ui/` (Shadcn/UI components)
   - Reference: `src/app/(dashboard)/conversations/page.tsx`
   - Use existing design tokens and component patterns

2. **Refer to specification for complete UI design**:
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\04-categories-to-conversation-pipeline-spec_v1.md`
   - Lines 1283-1541: Complete ScaffoldingSelector component specification

3. **Use controlled components**:
   - Single source of truth for selection state
   - Clear parent-child prop flow
   - Proper TypeScript types

4. **Test accessibility**:
   - Keyboard navigation (Tab, Enter, Esc)
   - Screen reader labels
   - Focus management

## Step 1: Create ScaffoldingSelector Component

**1.1 Create component file**

Create `src/components/conversations/scaffolding-selector.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Persona, EmotionalArc, TrainingTopic } from '@/lib/types/scaffolding.types';

interface ScaffoldingSelectorProps {
  value: ScaffoldingSelection;
  onChange: (selection: ScaffoldingSelection) => void;
  disabled?: boolean;
}

interface ScaffoldingSelection {
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  tier: 'template' | 'scenario' | 'edge_case';
}

export function ScaffoldingSelector({ value, onChange, disabled }: ScaffoldingSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [emotionalArcs, setEmotionalArcs] = useState<EmotionalArc[]>([]);
  const [trainingTopics, setTrainingTopics] = useState<TrainingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [compatibilityWarnings, setCompatibilityWarnings] = useState<string[]>([]);

  useEffect(() => {
    loadScaffoldingData();
  }, []);

  useEffect(() => {
    if (value.persona_id && value.emotional_arc_id && value.training_topic_id) {
      checkCompatibility();
    } else {
      setCompatibilityWarnings([]);
    }
  }, [value.persona_id, value.emotional_arc_id, value.training_topic_id]);

  async function loadScaffoldingData() {
    try {
      const [personasRes, arcsRes, topicsRes] = await Promise.all([
        fetch('/api/scaffolding/personas'),
        fetch('/api/scaffolding/emotional-arcs'),
        fetch('/api/scaffolding/training-topics')
      ]);

      const [personasData, arcsData, topicsData] = await Promise.all([
        personasRes.json(),
        arcsRes.json(),
        topicsRes.json()
      ]);

      setPersonas(personasData.personas || []);
      setEmotionalArcs(arcsData.emotional_arcs || []);
      setTrainingTopics(topicsData.training_topics || []);
    } catch (error) {
      console.error('Failed to load scaffolding data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkCompatibility() {
    try {
      const res = await fetch('/api/scaffolding/check-compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona_id: value.persona_id,
          emotional_arc_id: value.emotional_arc_id,
          training_topic_id: value.training_topic_id
        })
      });

      const result = await res.json();
      setCompatibilityWarnings(result.warnings || []);
    } catch (error) {
      console.error('Failed to check compatibility:', error);
    }
  }

  if (loading) {
    return <div className="space-y-4">Loading scaffolding data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Persona Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="persona-select">Client Persona</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Select the client character profile. This defines demographics, personality traits, and communication style.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.persona_id || undefined}
          onValueChange={(val) => onChange({ ...value, persona_id: val })}
          disabled={disabled}
        >
          <SelectTrigger id="persona-select">
            <SelectValue placeholder="Select a persona..." />
          </SelectTrigger>
          <SelectContent>
            {personas.map((persona) => (
              <SelectItem key={persona.id} value={persona.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{persona.name}</span>
                  <span className="text-xs text-muted-foreground">{persona.archetype_summary}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Emotional Arc Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="arc-select">Emotional Journey</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Select the emotional transformation pattern. This is the PRIMARY selector that determines conversation structure and response strategy.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.emotional_arc_id || undefined}
          onValueChange={(val) => onChange({ ...value, emotional_arc_id: val })}
          disabled={disabled}
        >
          <SelectTrigger id="arc-select">
            <SelectValue placeholder="Select an emotional arc..." />
          </SelectTrigger>
          <SelectContent>
            {emotionalArcs.map((arc) => (
              <SelectItem key={arc.id} value={arc.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{arc.name}</span>
                  <span className="text-xs text-muted-foreground">{arc.when_to_use}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Training Topic Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="topic-select">Training Topic</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Select the specific conversation topic. This provides domain context and typical questions.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={value.training_topic_id || undefined}
          onValueChange={(val) => onChange({ ...value, training_topic_id: val })}
          disabled={disabled}
        >
          <SelectTrigger id="topic-select">
            <SelectValue placeholder="Select a topic..." />
          </SelectTrigger>
          <SelectContent>
            {trainingTopics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{topic.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {topic.category} • {topic.complexity_level}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tier Selector */}
      <div className="space-y-2">
        <Label htmlFor="tier-select">Conversation Tier</Label>
        <Select
          value={value.tier}
          onValueChange={(val) => onChange({ ...value, tier: val as 'template' | 'scenario' | 'edge_case' })}
          disabled={disabled}
        >
          <SelectTrigger id="tier-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="template">Template (Tier 1) - Foundation patterns</SelectItem>
            <SelectItem value="scenario">Scenario (Tier 2) - Domain-specific contexts</SelectItem>
            <SelectItem value="edge_case">Edge Case (Tier 3) - Boundary conditions</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compatibility Warnings */}
      {compatibilityWarnings.length > 0 && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            <strong>Compatibility Notes:</strong>
            <ul className="mt-2 space-y-1">
              {compatibilityWarnings.map((warning, index) => (
                <li key={index} className="text-sm">• {warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Step 2: Update /conversations/generate Page

**2.1 Locate and update the page**

Find the /conversations/generate page (likely in `src/app/(dashboard)/conversations/generate/page.tsx` or similar).

Add the ScaffoldingSelector component:

```typescript
'use client';

import { useState } from 'react';
import { ScaffoldingSelector } from '@/components/conversations/scaffolding-selector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function GenerateConversationPage() {
  const [selection, setSelection] = useState({
    persona_id: null,
    emotional_arc_id: null,
    training_topic_id: null,
    tier: 'template' as const
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const isSelectionComplete =
    selection.persona_id &&
    selection.emotional_arc_id &&
    selection.training_topic_id &&
    selection.tier;

  async function handleGenerate() {
    if (!isSelectionComplete) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/conversations/generate-with-scaffolding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selection)
      });

      const data = await res.json();
      setResult(data);

      if (data.success) {
        // Redirect to conversation view or show success message
        alert(`Conversation generated successfully! ID: ${data.conversation_id}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate conversation');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Generate Training Conversation</h1>

      <Card className="p-6">
        <ScaffoldingSelector
          value={selection}
          onChange={setSelection}
          disabled={generating}
        />

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!isSelectionComplete || generating}
            size="lg"
          >
            {generating ? 'Generating...' : 'Generate Conversation'}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Generation Result</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
```

## Step 3: Test End-to-End Workflow

**3.1 Start development server**

```bash
npm run dev
```

**3.2 Navigate to /conversations/generate**

Open `http://localhost:3000/conversations/generate` in browser.

**3.3 Test scaffolding selection**

1. Verify all four dropdowns populate with data
2. Select a persona
3. Select an emotional arc
4. Select a training topic
5. Select a tier
6. Verify compatibility warnings appear (if applicable)
7. Verify "Generate" button enables when all selections are made

**3.4 Test conversation generation**

1. Click "Generate Conversation"
2. Wait for generation to complete (may take 10-30 seconds)
3. Verify success message and conversation ID returned
4. Navigate to conversation detail view to see generated conversation

**3.5 Test multiple combinations**

Generate at least 5 conversations with different combinations:

1. **Combination 1**: Marcus + Confusion→Clarity + HSA vs FSA + Template
2. **Combination 2**: Jennifer + Shame→Acceptance + Roth IRA + Scenario
3. **Combination 3**: David + Couple Conflict→Alignment + RMD + Template
4. **Combination 4**: Marcus + Overwhelm→Empowerment + Backdoor Roth + Scenario
5. **Combination 5**: Jennifer + Fear→Confidence + 401k Match + Template

For each, verify:
- Generation succeeds
- Conversation reflects selected persona's communication style
- Emotional arc pattern matches (starting emotion → ending emotion)
- Topic is addressed in conversation
- Quality score is reasonable (4.0+)

## Step 4: Accessibility Testing

**4.1 Keyboard navigation**

1. Tab through all dropdowns
2. Use arrow keys to navigate dropdown options
3. Press Enter to select options
4. Press Esc to close dropdowns
5. Tab to "Generate" button and press Enter
6. Verify focus indicators are visible throughout

**4.2 Screen reader testing** (optional but recommended)

1. Enable screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
2. Navigate through form
3. Verify labels are read correctly
4. Verify tooltips are accessible
5. Verify warnings are announced

## Step 5: Responsive Design Testing

**5.1 Test on different screen sizes**

1. Desktop (1920x1080): All elements fit comfortably
2. Laptop (1366x768): No horizontal scrolling, dropdowns readable
3. Tablet (768x1024): Stacked layout if needed, all elements accessible
4. Mobile (375x667): Simplified layout, dropdowns still usable

Adjust CSS if needed to ensure responsive behavior.

## Acceptance Checklist

Before marking this segment complete, verify:

- [ ] ScaffoldingSelector component created and rendering
- [ ] All four dropdowns (persona, arc, topic, tier) populate with data
- [ ] Compatibility warnings display when incompatible combinations selected
- [ ] Generate button only enables when all selections are made
- [ ] Conversation generation succeeds with scaffolding parameters
- [ ] At least 5 test conversations generated successfully
- [ ] Generated conversations reflect selected scaffolding data (persona style, emotional arc, topic)
- [ ] Conversations table has persona_id, emotional_arc_id, training_topic_id populated
- [ ] scaffolding_snapshot JSONB field contains complete scaffolding data
- [ ] Keyboard navigation works correctly
- [ ] UI is responsive on different screen sizes
- [ ] No TypeScript errors or warnings
- [ ] No console errors during generation

## Troubleshooting

**Issue**: Dropdowns are empty
**Solution**: Check API endpoints are returning data. Verify Prompt 1 population completed. Check browser console for fetch errors.

**Issue**: Compatibility warnings don't appear
**Solution**: Verify /api/scaffolding/check-compatibility endpoint is working. Check that personas have compatible_arcs arrays populated.

**Issue**: Generate button stays disabled
**Solution**: Check that all four selections (persona, arc, topic, tier) are being set. Verify state updates in ScaffoldingSelector onChange callback.

**Issue**: Generation fails with 500 error
**Solution**: Check server logs for error details. Verify ParameterAssemblyService and TemplateSelectionService are working. Ensure template selection logic has fallbacks.

**Issue**: Generated conversation doesn't reflect scaffolding data
**Solution**: Verify ParameterAssemblyService.constructSystemPrompt() includes all scaffolding context. Check that conversation-generator is using the assembled system prompt.

## Final Validation

**Complete System Test:**

1. Database has all scaffolding tables populated ✅
2. All service layer methods work correctly ✅
3. All API endpoints return expected data ✅
4. UI components render without errors ✅
5. End-to-end generation workflow succeeds ✅
6. Generated conversations have quality scores 4.0+ ✅
7. Scaffolding provenance tracked in conversations table ✅

**Success Criteria Met:**

If all checklists above are complete, the Categories-to-Conversations Pipeline E01 implementation is **COMPLETE**.

## Next Steps (Post-POC)

This POC implementation establishes the foundation. Future enhancements include:

1. **Phase 2 (Medium-term)**:
   - Category/chunk mapping to scaffolding suggestions
   - Batch generation from categorized content
   - CRUD UIs for scaffolding management
   - Project layer for multi-domain support

2. **Phase 3 (Long-term)**:
   - AI-assisted scaffolding gap analysis
   - Quality learning loop
   - CSV import/export for scaffolding data
   - Multi-domain scaling

Congratulations on completing the scaffolding system implementation!


+++++++++++++++++




---

## Summary and Next Steps

### Implementation Checklist

**Prompt 1: Database Foundation & Data Population**
- [ ] personas table created and populated
- [ ] emotional_arcs table created and populated
- [ ] training_topics table created and populated
- [ ] Foreign keys added to conversations table
- [ ] Foreign keys added to prompt_templates table
- [ ] All indexes created
- [ ] Seed data validated

**Prompt 2: Service Layer & API Integration**
- [ ] ScaffoldingDataService implemented
- [ ] ParameterAssemblyService implemented
- [ ] TemplateSelectionService implemented
- [ ] Scaffolding types defined
- [ ] API endpoints created and tested

**Prompt 3: UI Components & End-to-End Integration**
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

**Out of Scope for E01:**
- Category/chunk to scaffolding mapping
- Batch processing from categorized content
- CRUD UIs for scaffolding management
- CSV import/export
- Project layer / multi-tenant architecture
- AI-assisted scaffolding suggestion

These will be addressed in future phases per the strategic roadmap.

### Support and Troubleshooting

**If you encounter issues:**

1. **Database Issues**: Verify SAOL library is installed and environment variables are set
2. **Service Issues**: Check TypeScript compilation errors, verify table structures match types
3. **API Issues**: Check Next.js server logs, verify Supabase client is initialized correctly
4. **UI Issues**: Check browser console for errors, verify all dependencies are installed

**Reference Documents:**
- Strategic Overview: `04-categories-to-conversation-strategic-overview_v1.md`
- Pipeline Specification: `04-categories-to-conversation-pipeline-spec_v1.md`
- SAOL Quick Start: `supa-agent-ops/saol-agent-quick-start-guide_v1.md`

---

**Document Status**: Implementation execution instructions complete, ready for prompt execution
**Generated**: 2025-11-14
**Version**: E01
**Total Estimated Time**: 40-60 hours across 3 prompts
