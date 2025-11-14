# Categories-to-Conversations Pipeline Specification

**Version:** 1.0
**Date:** 2025-11-13
**Status:** Implementation Specification
**Purpose:** Technical specification for implementing the categories-to-conversations pipeline module

---

## Executive Summary

This document provides complete technical specifications for implementing the **categories-to-conversations pipeline module** in the train-data application. The specification focuses on the **Short-Term POC** (Proof of Concept) scope while establishing architecture patterns that support future enhancements.

**POC Scope:**
- Create database tables for conversation scaffolding data (personas, emotional arcs, training topics)
- Populate tables with data extracted from seed specifications
- Build scaffolding service layer for data management
- Update /conversations/generate UI with scaffolding selection dropdowns
- Implement pipeline service connecting scaffolding data to conversation generation
- Integrate with existing conversation-generator.ts without breaking changes

**Out of Scope for POC:**
- Project layer / multi-tenant architecture
- Categories/chunks to scaffolding mapping/suggestions
- Batch processing from categorized content
- CSV import/export interfaces
- CRUD UIs for scaffolding management

---

## Architecture Overview

### System Context

The pipeline module sits between user-selected scaffolding parameters and the existing conversation generation engine:

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│              /conversations/generate (Updated)               │
│                                                               │
│  [Persona ▼] [Emotional Arc ▼] [Topic ▼] [Tier ▼] [Generate]│
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                 Scaffolding Service Layer (NEW)              │
│  - ScaffoldingDataService: CRUD for personas/arcs/topics     │
│  - ParameterAssemblyService: Gather + validate parameters    │
│  - TemplateSelectionService: Choose template by arc + tier   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│              Conversation Generation Service                 │
│                    (Existing, Extended)                      │
│  - conversation-generator.ts: AI generation coordination     │
│  - template-service.ts: Template retrieval (updated)         │
│  - prompt-context-builder.ts: Prompt construction            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Persistence                          │
│  - conversations table: Generated conversation records       │
│  - conversation_turns table: Individual turns                │
│  - prompt_templates table: Templates (upgraded)              │
│  - personas table: Persona definitions (NEW)                 │
│  - emotional_arcs table: Emotional transformation templates  │
│  - training_topics table: Conversation topic catalog         │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Additive, Not Destructive:** Extend existing services, don't replace them
2. **Separation of Concerns:** Scaffolding layer independent of generation logic
3. **Data-Driven:** All scaffolding data in database, not hardcoded in code
4. **Validation-First:** Validate parameter compatibility before generation
5. **Future-Proof:** Architecture supports future mapping/suggestion layers

---

## Database Schema Specifications

### New Table: `personas`

Stores client persona definitions used in conversation generation.

**Purpose:** Define character profiles with demographics, financial backgrounds, personality traits, and communication styles for training data diversity.

```sql
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(100) NOT NULL, -- "Marcus-type: Overwhelmed Avoider"
  persona_type VARCHAR(50) NOT NULL, -- "overwhelmed_avoider", "anxious_planner", etc.
  short_name VARCHAR(50) NOT NULL, -- "Marcus", "Jennifer", "David"

  -- Description
  description TEXT NOT NULL, -- Full persona description
  archetype_summary VARCHAR(200), -- One-sentence summary

  -- Demographics (JSONB for flexibility)
  demographics JSONB NOT NULL, -- { "age_range": "35-40", "career": "tech worker", "income": "$120K-160K" }

  -- Financial Profile
  financial_background TEXT, -- "Promoted to senior engineer, received RSUs, no prior investment experience"
  financial_situation VARCHAR(50), -- "high_earner_low_savings", "mid_career_planning", etc.

  -- Personality & Communication
  personality_traits TEXT[], -- ["avoidant", "overwhelmed", "shame-prone", "delayed action"]
  communication_style TEXT, -- "Brief, hesitant, self-deprecating, seeks reassurance"
  emotional_baseline VARCHAR(50), -- "anxious", "confident", "overwhelmed", "curious"
  decision_style VARCHAR(50), -- "analytical", "intuitive", "avoidant", "impulsive"

  -- Conversation Behavior Patterns
  typical_questions TEXT[], -- Example questions this persona asks
  common_concerns TEXT[], -- Common worries and fears
  language_patterns TEXT[], -- Characteristic phrases ("this might sound stupid")

  -- Usage Metadata
  domain VARCHAR(50) DEFAULT 'financial_planning', -- For future multi-domain
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0, -- Track how often used in conversations

  -- Compatibility (for future template matching)
  compatible_arcs TEXT[], -- Emotional arcs this persona works well with
  complexity_preference VARCHAR(20), -- "simple", "moderate", "complex"

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID, -- NULL for seed data

  -- Constraints
  UNIQUE(persona_type, domain), -- One persona_type per domain
  CHECK (emotional_baseline IN ('anxious', 'confident', 'overwhelmed', 'curious', 'uncertain', 'determined'))
);

-- Indexes
CREATE INDEX idx_personas_persona_type ON personas(persona_type);
CREATE INDEX idx_personas_domain ON personas(domain);
CREATE INDEX idx_personas_is_active ON personas(is_active);
CREATE INDEX idx_personas_emotional_baseline ON personas(emotional_baseline);
```

**Example Record:**

```json
{
  "id": "uuid-generated",
  "name": "Marcus-type: Overwhelmed Avoider",
  "persona_type": "overwhelmed_avoider",
  "short_name": "Marcus",
  "description": "Mid-30s tech worker who has avoided financial planning despite high income. Recently promoted with equity compensation but feels shame about not understanding basics. Tends to procrastinate on financial decisions.",
  "archetype_summary": "High-earning tech professional overwhelmed by financial complexity and ashamed of knowledge gaps.",
  "demographics": {
    "age_range": "35-40",
    "career": "tech worker / software engineer",
    "income_range": "$120K-160K",
    "family_status": "single or married no kids",
    "education": "bachelor's or master's in technical field"
  },
  "financial_background": "Promoted to senior engineer, received RSUs, 401k with company match but never adjusted allocations, some credit card debt from lifestyle inflation, no emergency fund despite high income.",
  "financial_situation": "high_earner_low_financial_literacy",
  "personality_traits": ["avoidant", "overwhelmed", "shame-prone", "delayed action", "perfectionistic"],
  "communication_style": "Brief questions, self-deprecating language, seeks reassurance, apologizes for not knowing, delayed responses",
  "emotional_baseline": "overwhelmed",
  "decision_style": "avoidant",
  "typical_questions": [
    "I got promoted and got RSUs but have no idea what that means",
    "This might sound stupid, but what's a Roth IRA?",
    "Everyone at work talks about backdoor Roths and I just nod along",
    "I'm 38 and have barely anything saved for retirement - is it too late?"
  ],
  "common_concerns": [
    "Being judged for not knowing basics",
    "Making mistakes with money",
    "Feeling behind peers financially",
    "Complexity of financial concepts",
    "Not having enough time to learn"
  ],
  "language_patterns": [
    "This might sound stupid, but...",
    "I should have done this years ago",
    "Everyone else seems to understand this",
    "I just need someone to tell me what to do",
    "This is probably a dumb question"
  ],
  "domain": "financial_planning",
  "is_active": true,
  "usage_count": 0,
  "compatible_arcs": ["confusion_to_clarity", "shame_to_acceptance", "overwhelm_to_empowerment"],
  "complexity_preference": "simple"
}
```

### New Table: `emotional_arcs`

Stores emotional transformation templates for conversation generation.

**Purpose:** Define emotional journey patterns that guide conversation structure and assistant response strategy.

```sql
CREATE TABLE emotional_arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(100) NOT NULL, -- "Confusion → Clarity"
  arc_type VARCHAR(50) NOT NULL UNIQUE, -- "confusion_to_clarity"
  category VARCHAR(50), -- "educational", "therapeutic", "conflict_resolution"

  -- Description
  description TEXT NOT NULL, -- Full arc description
  when_to_use TEXT, -- Guidance on appropriate situations

  -- Emotional Progression
  starting_emotion VARCHAR(50) NOT NULL, -- "confusion"
  starting_intensity_min NUMERIC(3,2), -- 0.70
  starting_intensity_max NUMERIC(3,2), -- 0.85
  secondary_starting_emotions TEXT[], -- ["embarrassment", "overwhelm"]

  midpoint_emotion VARCHAR(50), -- "recognition"
  midpoint_intensity NUMERIC(3,2), -- 0.65

  ending_emotion VARCHAR(50) NOT NULL, -- "clarity"
  ending_intensity_min NUMERIC(3,2), -- 0.70
  ending_intensity_max NUMERIC(3,2), -- 0.80
  secondary_ending_emotions TEXT[], -- ["confidence", "empowerment"]

  -- Structural Pattern (JSONB for rich data)
  turn_structure JSONB, -- { "typical_turns": 3-5, "pattern": ["express confusion", "normalize + educate", "follow-up", "clarity"] }
  conversation_phases TEXT[], -- ["confusion expression", "normalization", "education", "clarity confirmation"]

  -- Response Strategy Guidance
  primary_strategy VARCHAR(100), -- "normalize_confusion_educate"
  response_techniques TEXT[], -- ["explicit normalization", "break complexity", "concrete examples", "ask permission"]
  avoid_tactics TEXT[], -- ["rush to solutions", "minimize confusion", "use jargon"]

  -- Elena Morales Principles Applied (which of the 5 principles most critical)
  key_principles TEXT[], -- ["judgment_free_space", "education_first"]

  -- Communication Patterns
  characteristic_phrases TEXT[], -- ["I can hear the confusion", "this is incredibly common", "let's break this down"]
  opening_templates TEXT[], -- Templates for first assistant response
  closing_templates TEXT[], -- Templates for final assistant response

  -- Usage Metadata
  tier_suitability TEXT[], -- ["template", "scenario"] - which tiers this arc works for
  domain VARCHAR(50) DEFAULT 'financial_planning',
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,

  -- Quality Expectations
  typical_turn_count_min INT, -- 3
  typical_turn_count_max INT, -- 5
  complexity_level VARCHAR(20), -- "moderate"

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

-- Indexes
CREATE INDEX idx_emotional_arcs_arc_type ON emotional_arcs(arc_type);
CREATE INDEX idx_emotional_arcs_domain ON emotional_arcs(domain);
CREATE INDEX idx_emotional_arcs_is_active ON emotional_arcs(is_active);
CREATE INDEX idx_emotional_arcs_starting_emotion ON emotional_arcs(starting_emotion);
```

**Example Record:**

```json
{
  "id": "uuid-generated",
  "name": "Confusion → Clarity",
  "arc_type": "confusion_to_clarity",
  "category": "educational",
  "description": "Guides clients from genuine confusion about financial concepts to clear understanding through judgment-free education. Most common arc for complex financial topics.",
  "when_to_use": "When client expresses confusion about financial concepts, shows decision paralysis from complexity, or uses self-deprecating language about not understanding. Ideal for educational conversations about complex topics.",
  "starting_emotion": "confusion",
  "starting_intensity_min": 0.70,
  "starting_intensity_max": 0.85,
  "secondary_starting_emotions": ["embarrassment", "overwhelm", "uncertainty"],
  "midpoint_emotion": "recognition",
  "midpoint_intensity": 0.65,
  "ending_emotion": "clarity",
  "ending_intensity_min": 0.70,
  "ending_intensity_max": 0.80,
  "secondary_ending_emotions": ["confidence", "empowerment", "relief"],
  "turn_structure": {
    "typical_turns": "3-5",
    "turn_1": "User expresses confusion about concept, often with self-deprecation",
    "turn_2": "User provides details, shows slight relief at normalization",
    "turn_3_4": "User asks follow-up questions, shows growing understanding",
    "turn_5": "User expresses clarity and readiness to act (if applicable)"
  },
  "conversation_phases": [
    "confusion_expression",
    "normalization_and_reframe",
    "education_and_breakdown",
    "understanding_confirmation",
    "clarity_celebration"
  ],
  "primary_strategy": "normalize_confusion_then_educate",
  "response_techniques": [
    "explicit_normalization (this is incredibly common)",
    "reframe_to_positive (you're asking exactly the right question)",
    "break_complexity_into_simple_steps",
    "use_concrete_numbers",
    "ask_permission_to_educate",
    "celebrate_understanding_progress"
  ],
  "avoid_tactics": [
    "rush_to_solutions_before_validation",
    "minimize_confusion (it's not that complicated)",
    "use_jargon_without_explanation",
    "assume_prior_knowledge"
  ],
  "key_principles": [
    "judgment_free_space",
    "education_first",
    "progress_over_perfection"
  ],
  "characteristic_phrases": [
    "I can hear the confusion in your question",
    "This is incredibly common - you're not alone",
    "Let's break this down simply",
    "Would it be helpful if I explained...",
    "You're asking exactly the right question",
    "Does that make sense?"
  ],
  "opening_templates": [
    "First, {normalize_shame_statement}. {financial_concept} is genuinely {complexity_acknowledgment}.",
    "I can hear the {detected_emotion} in your question - that's completely {validation}. Let me break down {topic} in a way that makes sense."
  ],
  "closing_templates": [
    "Does that help clarify things? You went from {starting_state} to {clear_understanding} - that's real progress.",
    "You're asking all the right questions now. {next_step_invitation}."
  ],
  "tier_suitability": ["template", "scenario"],
  "domain": "financial_planning",
  "is_active": true,
  "usage_count": 0,
  "typical_turn_count_min": 3,
  "typical_turn_count_max": 5,
  "complexity_level": "moderate"
}
```

### New Table: `training_topics`

Stores conversation topic catalog with categorization and metadata.

**Purpose:** Define specific conversation topics with domain context, complexity, and categorization for training data organization.

```sql
CREATE TABLE training_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name VARCHAR(200) NOT NULL, -- "HSA vs FSA Decision Paralysis"
  topic_key VARCHAR(100) NOT NULL, -- "hsa_vs_fsa_decision"
  category VARCHAR(100), -- "healthcare_accounts", "retirement_planning", etc.

  -- Description
  description TEXT NOT NULL, -- Full topic description
  typical_question_examples TEXT[], -- Example questions clients ask

  -- Classification
  domain VARCHAR(50) DEFAULT 'financial_planning',
  content_category VARCHAR(100), -- "retirement planning", "investment", "tax planning"
  complexity_level VARCHAR(20), -- "basic", "intermediate", "advanced"

  -- Context Requirements
  requires_numbers BOOLEAN DEFAULT false, -- Does this topic need specific dollar amounts?
  requires_timeframe BOOLEAN DEFAULT false, -- Does this need dates/timelines?
  requires_personal_context BOOLEAN DEFAULT false, -- Does this need family/career details?

  -- Suitability
  suitable_personas TEXT[], -- Which personas commonly have this question
  suitable_arcs TEXT[], -- Which emotional arcs work well with this topic
  suitable_tiers TEXT[], -- ["template", "scenario", "edge_case"]

  -- Metadata
  tags TEXT[], -- ["tax_advantaged", "healthcare", "decision_making"]
  related_topics TEXT[], -- IDs or keys of related topics

  -- Usage
  is_active BOOLEAN DEFAULT true,
  usage_count INT DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'normal', -- "high", "normal", "low"

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,

  -- Constraints
  UNIQUE(topic_key, domain),
  CHECK (complexity_level IN ('basic', 'intermediate', 'advanced')),
  CHECK (priority IN ('high', 'normal', 'low'))
);

-- Indexes
CREATE INDEX idx_training_topics_topic_key ON training_topics(topic_key);
CREATE INDEX idx_training_topics_domain ON training_topics(domain);
CREATE INDEX idx_training_topics_category ON training_topics(category);
CREATE INDEX idx_training_topics_complexity ON training_topics(complexity_level);
CREATE INDEX idx_training_topics_is_active ON training_topics(is_active);
```

**Example Record:**

```json
{
  "id": "uuid-generated",
  "name": "HSA vs FSA Decision Paralysis",
  "topic_key": "hsa_vs_fsa_decision",
  "category": "healthcare_accounts",
  "description": "Client confusion about choosing between Health Savings Account (HSA) and Flexible Spending Account (FSA). Common confusion points: eligibility requirements, tax advantages, contribution limits, rollover rules, investment options.",
  "typical_question_examples": [
    "What's the difference between an HSA and FSA?",
    "My employer offers both - which should I choose?",
    "Can I have both an HSA and FSA at the same time?",
    "I don't understand the tax benefits - which is better?",
    "What happens to FSA money at the end of the year?"
  ],
  "domain": "financial_planning",
  "content_category": "healthcare_and_benefits",
  "complexity_level": "intermediate",
  "requires_numbers": true,
  "requires_timeframe": false,
  "requires_personal_context": true,
  "suitable_personas": ["overwhelmed_avoider", "anxious_planner"],
  "suitable_arcs": ["confusion_to_clarity", "overwhelm_to_empowerment"],
  "suitable_tiers": ["template", "scenario"],
  "tags": ["tax_advantaged", "healthcare", "decision_making", "employee_benefits"],
  "related_topics": ["high_deductible_health_plan", "healthcare_budgeting"],
  "is_active": true,
  "usage_count": 0,
  "priority": "normal"
}
```

### Modified Table: `prompt_templates`

Extend existing template table to support emotional arc integration.

**Migration Required:**

```sql
-- Add new fields to existing prompt_templates table
ALTER TABLE prompt_templates
  ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
  ADD COLUMN IF NOT EXISTS emotional_arc_type VARCHAR(50), -- Denormalized for query performance
  ADD COLUMN IF NOT EXISTS suitable_personas TEXT[], -- Which personas this template works for
  ADD COLUMN IF NOT EXISTS suitable_topics TEXT[], -- Which topics this template works for
  ADD COLUMN IF NOT EXISTS methodology_principles TEXT[]; -- Which Elena principles emphasized

-- Add index for emotional arc queries
CREATE INDEX idx_prompt_templates_emotional_arc_id ON prompt_templates(emotional_arc_id);
CREATE INDEX idx_prompt_templates_emotional_arc_type ON prompt_templates(emotional_arc_type);
```

### Modified Table: `conversations`

Extend to include scaffolding provenance.

**Migration Required:**

```sql
-- Add scaffolding data provenance to conversations table
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id),
  ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
  ADD COLUMN IF NOT EXISTS training_topic_id UUID REFERENCES training_topics(id),
  ADD COLUMN IF NOT EXISTS scaffolding_snapshot JSONB; -- Snapshot of scaffolding data at generation time

-- Add indexes for scaffolding queries
CREATE INDEX idx_conversations_persona_id ON conversations(persona_id);
CREATE INDEX idx_conversations_emotional_arc_id ON conversations(emotional_arc_id);
CREATE INDEX idx_conversations_training_topic_id ON conversations(training_topic_id);
```

**Purpose of `scaffolding_snapshot`:**
- Captures full persona, arc, and topic data as it existed during generation
- Protects against data changes breaking conversation provenance
- Enables regeneration with exact same parameters
- JSONB structure:

```json
{
  "persona": { /* full persona record */ },
  "emotional_arc": { /* full arc record */ },
  "training_topic": { /* full topic record */ },
  "generation_timestamp": "2025-11-13T10:30:00Z",
  "scaffolding_version": "1.0"
}
```

---

## Service Layer Specifications

### Service 1: `ScaffoldingDataService`

**Purpose:** CRUD operations for personas, emotional arcs, and training topics.

**Location:** `src/lib/services/scaffolding-data-service.ts`

**Interface:**

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

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

export class ScaffoldingDataService {
  constructor(private supabase: SupabaseClient) {}

  // Persona Operations
  async getAllPersonas(filters?: {
    domain?: string;
    is_active?: boolean;
    emotional_baseline?: string;
  }): Promise<Persona[]>;

  async getPersonaById(id: string): Promise<Persona | null>;
  async getPersonaByType(persona_type: string, domain?: string): Promise<Persona | null>;
  async incrementPersonaUsage(id: string): Promise<void>;

  // Emotional Arc Operations
  async getAllEmotionalArcs(filters?: {
    domain?: string;
    is_active?: boolean;
    category?: string;
  }): Promise<EmotionalArc[]>;

  async getEmotionalArcById(id: string): Promise<EmotionalArc | null>;
  async getEmotionalArcByType(arc_type: string, domain?: string): Promise<EmotionalArc | null>;
  async incrementArcUsage(id: string): Promise<void>;

  // Training Topic Operations
  async getAllTrainingTopics(filters?: {
    domain?: string;
    is_active?: boolean;
    category?: string;
    complexity_level?: string;
  }): Promise<TrainingTopic[]>;

  async getTrainingTopicById(id: string): Promise<TrainingTopic | null>;
  async getTrainingTopicByKey(topic_key: string, domain?: string): Promise<TrainingTopic | null>;
  async incrementTopicUsage(id: string): Promise<void>;

  // Compatibility Checking
  async checkCompatibility(params: {
    persona_id: string;
    arc_id: string;
    topic_id: string;
  }): Promise<CompatibilityResult>;
}

export interface CompatibilityResult {
  is_compatible: boolean;
  warnings: string[];
  suggestions: string[];
  confidence: number; // 0-1
}
```

**Implementation Notes:**
- Use existing Supabase patterns from template-service.ts
- Handle JSONB fields appropriately (demographics, turn_structure, etc.)
- Implement proper error handling and validation
- Log all data access for debugging

**Error Handling:**
- Throw descriptive errors with context
- Validate required fields before database operations
- Handle foreign key violations gracefully
- Provide user-friendly error messages

### Service 2: `ParameterAssemblyService`

**Purpose:** Assemble and validate all parameters needed for conversation generation.

**Location:** `src/lib/services/parameter-assembly-service.ts`

**Interface:**

```typescript
import { Persona, EmotionalArc, TrainingTopic } from './scaffolding-data-service';
import type { TierType } from '@/lib/types';

export interface ConversationParameters {
  // Scaffolding Data
  persona: Persona;
  emotional_arc: EmotionalArc;
  training_topic: TrainingTopic;
  tier: TierType;

  // Template Selection
  template_id?: string; // Selected template (optional, can be auto-selected)

  // Generation Configuration
  temperature?: number; // 0.6-0.8 depending on arc and topic
  max_tokens?: number; // 2048-4096
  target_turn_count?: number; // From emotional arc

  // Additional Context (optional)
  chunk_id?: string; // If generating from chunk
  chunk_context?: string; // Chunk text for context injection
  document_id?: string; // If generating from document

  // Metadata
  created_by?: string; // User ID
  generation_mode: 'manual' | 'chunk_based' | 'batch';
}

export interface AssembledParameters {
  conversation_params: ConversationParameters;
  template_variables: Record<string, any>; // Variables to inject into template
  system_prompt: string; // Constructed system prompt
  metadata: {
    compatibility_score: number;
    warnings: string[];
    suggestions: string[];
  };
}

export class ParameterAssemblyService {
  constructor(
    private scaffoldingService: ScaffoldingDataService,
    private templateSelectionService: TemplateSelectionService
  ) {}

  /**
   * Assemble all parameters needed for conversation generation
   */
  async assembleParameters(input: {
    persona_id: string;
    emotional_arc_id: string;
    training_topic_id: string;
    tier: TierType;
    template_id?: string; // Optional override
    chunk_id?: string;
    created_by?: string;
  }): Promise<AssembledParameters>;

  /**
   * Validate parameter compatibility
   */
  async validateParameters(params: ConversationParameters): Promise<ValidationResult>;

  /**
   * Build template variables from scaffolding data
   */
  buildTemplateVariables(params: ConversationParameters): Record<string, any>;

  /**
   * Construct system prompt from scaffolding data
   */
  constructSystemPrompt(params: ConversationParameters): string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}
```

**Implementation Logic:**

```typescript
async assembleParameters(input): Promise<AssembledParameters> {
  // 1. Fetch scaffolding data
  const persona = await this.scaffoldingService.getPersonaById(input.persona_id);
  const emotional_arc = await this.scaffoldingService.getEmotionalArcById(input.emotional_arc_id);
  const training_topic = await this.scaffoldingService.getTrainingTopicById(input.training_topic_id);

  // 2. Validate all data exists
  if (!persona || !emotional_arc || !training_topic) {
    throw new Error('Missing required scaffolding data');
  }

  // 3. Check compatibility
  const compatibility = await this.scaffoldingService.checkCompatibility({
    persona_id: input.persona_id,
    arc_id: input.emotional_arc_id,
    topic_id: input.training_topic_id
  });

  // 4. Select template (auto or manual)
  let template_id = input.template_id;
  if (!template_id) {
    template_id = await this.templateSelectionService.selectTemplate({
      emotional_arc_type: emotional_arc.arc_type,
      tier: input.tier,
      persona_type: persona.persona_type,
      topic_key: training_topic.topic_key
    });
  }

  // 5. Build conversation parameters
  const conversation_params: ConversationParameters = {
    persona,
    emotional_arc,
    training_topic,
    tier: input.tier,
    template_id,
    temperature: this.determineTemperature(emotional_arc, training_topic),
    max_tokens: 2048,
    target_turn_count: emotional_arc.typical_turn_count_min || 3,
    chunk_id: input.chunk_id,
    created_by: input.created_by,
    generation_mode: 'manual'
  };

  // 6. Validate parameters
  const validation = await this.validateParameters(conversation_params);
  if (!validation.is_valid) {
    throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
  }

  // 7. Build template variables
  const template_variables = this.buildTemplateVariables(conversation_params);

  // 8. Construct system prompt
  const system_prompt = this.constructSystemPrompt(conversation_params);

  // 9. Return assembled parameters
  return {
    conversation_params,
    template_variables,
    system_prompt,
    metadata: {
      compatibility_score: compatibility.confidence,
      warnings: [...compatibility.warnings, ...validation.warnings],
      suggestions: [...compatibility.suggestions, ...validation.suggestions]
    }
  };
}

buildTemplateVariables(params: ConversationParameters): Record<string, any> {
  return {
    // Persona variables
    persona_name: params.persona.short_name,
    persona_type: params.persona.persona_type,
    persona_archetype: params.persona.archetype_summary,
    persona_age: params.persona.demographics.age_range,
    persona_career: params.persona.demographics.career,
    persona_income: params.persona.demographics.income_range,
    persona_financial_situation: params.persona.financial_background,
    persona_communication_style: params.persona.communication_style,

    // Emotional arc variables
    emotional_arc_name: params.emotional_arc.name,
    starting_emotion: params.emotional_arc.starting_emotion,
    ending_emotion: params.emotional_arc.ending_emotion,
    arc_strategy: params.emotional_arc.primary_strategy,
    arc_key_principles: params.emotional_arc.key_principles.join(', '),

    // Topic variables
    topic_name: params.training_topic.name,
    topic_description: params.training_topic.description,
    topic_category: params.training_topic.content_category,
    topic_complexity: params.training_topic.complexity_level,
    typical_questions: params.training_topic.typical_question_examples.join('\n- '),

    // Additional context
    tier: params.tier,
    target_turns: params.target_turn_count,
    chunk_context: params.chunk_context || ''
  };
}

constructSystemPrompt(params: ConversationParameters): string {
  // Build Elena Morales system prompt with all 5 principles
  return `You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning.

Your core principles:
1. Money is emotional - Acknowledge feelings before facts in EVERY response
2. Judgment-free space - Normalize confusion/shame explicitly
3. Education-first - Teach "why" not just "what"
4. Progress over perfection - Celebrate existing understanding
5. Values-aligned - Personal context over generic rules

Current conversation context:
- Client Persona: ${params.persona.name}
- Emotional Journey: ${params.emotional_arc.name}
- Topic: ${params.training_topic.name}
- Complexity Level: ${params.training_topic.complexity_level}

Communication patterns for this arc:
${params.emotional_arc.characteristic_phrases.map(p => `- ${p}`).join('\n')}

Response techniques to use:
${params.emotional_arc.response_techniques.map(t => `- ${t}`).join('\n')}

Tactics to avoid:
${params.emotional_arc.avoid_tactics.map(t => `- ${t}`).join('\n')}

Client communication style: ${params.persona.communication_style}

Typical client concerns:
${params.persona.common_concerns.map(c => `- ${c}`).join('\n')}

Your goal: Guide this client from ${params.emotional_arc.starting_emotion} to ${params.emotional_arc.ending_emotion} through ${params.target_turn_count || '3-5'} conversational turns, maintaining Elena's voice and methodology throughout.`;
}

determineTemperature(arc: EmotionalArc, topic: TrainingTopic): number {
  // Educational arcs: Lower temperature (more structured)
  if (arc.category === 'educational') return 0.65;

  // Therapeutic/conflict arcs: Higher temperature (more empathetic)
  if (arc.category === 'therapeutic' || arc.category === 'conflict_resolution') return 0.75;

  // Complex topics: Moderate temperature
  if (topic.complexity_level === 'advanced') return 0.70;

  // Default
  return 0.70;
}
```

### Service 3: `TemplateSelectionService`

**Purpose:** Select appropriate template based on emotional arc, tier, and context.

**Location:** `src/lib/services/template-selection-service.ts`

**Interface:**

```typescript
import { SupabaseClient } from '@supabase/supabase-js';

export interface TemplateSelectionCriteria {
  emotional_arc_type: string; // Primary selector
  tier: TierType; // Secondary filter
  persona_type?: string; // Tertiary compatibility check
  topic_key?: string; // Quaternary context
}

export interface TemplateSelectionResult {
  template_id: string;
  template_name: string;
  confidence_score: number; // 0-1
  rationale: string;
  alternatives: Array<{
    template_id: string;
    template_name: string;
    confidence_score: number;
  }>;
}

export class TemplateSelectionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Select best template based on criteria
   */
  async selectTemplate(criteria: TemplateSelectionCriteria): Promise<string>;

  /**
   * Get detailed selection result with rationale
   */
  async selectTemplateWithRationale(criteria: TemplateSelectionCriteria): Promise<TemplateSelectionResult>;

  /**
   * Get all compatible templates ranked by fit
   */
  async getRankedTemplates(criteria: TemplateSelectionCriteria): Promise<TemplateSelectionResult[]>;
}
```

**Implementation Logic:**

```typescript
async selectTemplate(criteria: TemplateSelectionCriteria): Promise<string> {
  // 1. Query templates matching emotional arc and tier
  const { data: templates, error } = await this.supabase
    .from('prompt_templates')
    .select('*')
    .eq('emotional_arc_type', criteria.emotional_arc_type)
    .eq('tier', criteria.tier)
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .order('usage_count', { ascending: false });

  if (error || !templates || templates.length === 0) {
    throw new Error(`No templates found for arc: ${criteria.emotional_arc_type}, tier: ${criteria.tier}`);
  }

  // 2. If persona specified, filter for compatibility
  let filtered_templates = templates;
  if (criteria.persona_type) {
    filtered_templates = templates.filter(t =>
      !t.suitable_personas ||
      t.suitable_personas.length === 0 ||
      t.suitable_personas.includes(criteria.persona_type)
    );
  }

  // 3. If topic specified, filter for compatibility
  if (criteria.topic_key) {
    filtered_templates = filtered_templates.filter(t =>
      !t.suitable_topics ||
      t.suitable_topics.length === 0 ||
      t.suitable_topics.includes(criteria.topic_key)
    );
  }

  // 4. Fallback if filtering eliminated all options
  if (filtered_templates.length === 0) {
    console.warn('No perfectly matching templates, using best arc+tier match');
    filtered_templates = templates;
  }

  // 5. Return highest rated template
  return filtered_templates[0].id;
}

async selectTemplateWithRationale(criteria: TemplateSelectionCriteria): Promise<TemplateSelectionResult> {
  const ranked = await this.getRankedTemplates(criteria);

  if (ranked.length === 0) {
    throw new Error('No templates available for selection');
  }

  return ranked[0];
}

async getRankedTemplates(criteria: TemplateSelectionCriteria): Promise<TemplateSelectionResult[]> {
  // Query all potentially matching templates
  const { data: templates } = await this.supabase
    .from('prompt_templates')
    .select('*')
    .eq('emotional_arc_type', criteria.emotional_arc_type)
    .eq('is_active', true);

  if (!templates || templates.length === 0) {
    return [];
  }

  // Score each template
  const scored = templates.map(template => {
    let score = 0.5; // Base score
    let rationale_parts: string[] = [];

    // Tier match (required)
    if (template.tier === criteria.tier) {
      score += 0.2;
      rationale_parts.push(`Tier match (${criteria.tier})`);
    } else {
      return null; // Tier mismatch is disqualifying
    }

    // Persona compatibility
    if (criteria.persona_type) {
      if (!template.suitable_personas || template.suitable_personas.length === 0) {
        // Template works with all personas
        score += 0.1;
        rationale_parts.push('Works with all personas');
      } else if (template.suitable_personas.includes(criteria.persona_type)) {
        score += 0.15;
        rationale_parts.push(`Persona match (${criteria.persona_type})`);
      } else {
        score -= 0.05;
        rationale_parts.push(`Persona mismatch`);
      }
    }

    // Topic compatibility
    if (criteria.topic_key) {
      if (!template.suitable_topics || template.suitable_topics.length === 0) {
        score += 0.05;
        rationale_parts.push('Works with all topics');
      } else if (template.suitable_topics.includes(criteria.topic_key)) {
        score += 0.1;
        rationale_parts.push(`Topic match (${criteria.topic_key})`);
      }
    }

    // Quality indicators
    if (template.rating >= 4.5) {
      score += 0.05;
      rationale_parts.push(`High rating (${template.rating})`);
    }

    const rationale = rationale_parts.join(', ');

    return {
      template_id: template.id,
      template_name: template.template_name,
      confidence_score: Math.min(score, 1.0),
      rationale
    };
  }).filter(Boolean);

  // Sort by confidence descending
  scored.sort((a, b) => b!.confidence_score - a!.confidence_score);

  // Format results
  const results: TemplateSelectionResult[] = scored.map((primary, index) => ({
    template_id: primary!.template_id,
    template_name: primary!.template_name,
    confidence_score: primary!.confidence_score,
    rationale: primary!.rationale,
    alternatives: scored.slice(index + 1, index + 3).map(alt => ({
      template_id: alt!.template_id,
      template_name: alt!.template_name,
      confidence_score: alt!.confidence_score
    }))
  }));

  return results;
}
```

---

## API Endpoint Specifications

### POST /api/conversations/generate-with-scaffolding

**Purpose:** Generate conversation using scaffolding parameters.

**Location:** `src/app/api/conversations/generate-with-scaffolding/route.ts`

**Request:**

```typescript
{
  persona_id: string;
  emotional_arc_id: string;
  training_topic_id: string;
  tier: TierType;
  template_id?: string; // Optional manual override
  chunk_id?: string; // Optional chunk context
  temperature?: number; // Optional override
  max_tokens?: number; // Optional override
}
```

**Response:**

```typescript
{
  success: boolean;
  conversation_id: string;
  conversation: {
    id: string;
    title: string;
    turns: ConversationTurn[];
    qualityScore: number;
    status: ConversationStatus;
    scaffolding_snapshot: Record<string, any>;
  };
  metadata: {
    generation_time_ms: number;
    token_count: number;
    compatibility_warnings: string[];
    template_used: string;
  };
  error?: string;
}
```

**Implementation:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ScaffoldingDataService } from '@/lib/services/scaffolding-data-service';
import { ParameterAssemblyService } from '@/lib/services/parameter-assembly-service';
import { TemplateSelectionService } from '@/lib/services/template-selection-service';
import { ConversationGenerator } from '@/lib/generation/conversation-generator';

export const maxDuration = 300; // 5 minutes for Claude API calls

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse request
    const body = await request.json();
    const { persona_id, emotional_arc_id, training_topic_id, tier, template_id, chunk_id } = body;

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
    const conversationGenerator = new ConversationGenerator(supabase);

    // 4. Assemble parameters
    const assembled = await parameterAssemblyService.assembleParameters({
      persona_id,
      emotional_arc_id,
      training_topic_id,
      tier,
      template_id,
      chunk_id
    });

    // 5. Generate conversation
    const conversation = await conversationGenerator.generate({
      template_id: assembled.conversation_params.template_id!,
      system_prompt: assembled.system_prompt,
      variables: assembled.template_variables,
      temperature: assembled.conversation_params.temperature,
      max_tokens: assembled.conversation_params.max_tokens
    });

    // 6. Update conversation with scaffolding provenance
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        persona_id: assembled.conversation_params.persona.id,
        emotional_arc_id: assembled.conversation_params.emotional_arc.id,
        training_topic_id: assembled.conversation_params.training_topic.id,
        scaffolding_snapshot: {
          persona: assembled.conversation_params.persona,
          emotional_arc: assembled.conversation_params.emotional_arc,
          training_topic: assembled.conversation_params.training_topic,
          generation_timestamp: new Date().toISOString(),
          scaffolding_version: '1.0'
        }
      })
      .eq('id', conversation.id);

    if (updateError) {
      console.error('Failed to update conversation with scaffolding data:', updateError);
    }

    // 7. Increment usage counts
    await Promise.all([
      scaffoldingService.incrementPersonaUsage(persona_id),
      scaffoldingService.incrementArcUsage(emotional_arc_id),
      scaffoldingService.incrementTopicUsage(training_topic_id)
    ]);

    // 8. Return success response
    return NextResponse.json({
      success: true,
      conversation_id: conversation.id,
      conversation,
      metadata: {
        generation_time_ms: Date.now() - startTime,
        token_count: conversation.totalTokens,
        compatibility_warnings: assembled.metadata.warnings,
        template_used: assembled.conversation_params.template_id
      }
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

---

## UI Component Specifications

### Component: `ScaffoldingSelector`

**Purpose:** Dropdown selectors for persona, emotional arc, and training topic on /conversations/generate page.

**Location:** `src/components/conversations/scaffolding-selector.tsx`

**Props:**

```typescript
interface ScaffoldingSelectorProps {
  value: ScaffoldingSelection;
  onChange: (selection: ScaffoldingSelection) => void;
  disabled?: boolean;
}

interface ScaffoldingSelection {
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  tier: TierType;
}
```

**Implementation:**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
    checkCompatibility();
  }, [value]);

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

      setPersonas(personasData.personas);
      setEmotionalArcs(arcsData.emotional_arcs);
      setTrainingTopics(topicsData.training_topics);
    } catch (error) {
      console.error('Failed to load scaffolding data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkCompatibility() {
    if (!value.persona_id || !value.emotional_arc_id || !value.training_topic_id) {
      setCompatibilityWarnings([]);
      return;
    }

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
          onValueChange={(val) => onChange({ ...value, tier: val as TierType })}
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

---

## Data Population Script Specification

**Purpose:** Extract scaffolding data from seed specifications and populate database.

**Location:** `src/scripts/populate-scaffolding-data.ts`

**Execution:** `npm run populate-scaffolding`

**Data Sources:**
1. `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\c-alpha-build_v3.4-LoRA-FP-100-spec.md`
2. `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\` (conversations 1-10)

**Implementation Strategy:**

```typescript
import { createClient } from '@/lib/supabase/server';
import * as fs from 'fs';
import * as path from 'path';

// Define seed data structures
const PERSONAS_SEED = [
  {
    name: "Marcus-type: Overwhelmed Avoider",
    persona_type: "overwhelmed_avoider",
    short_name: "Marcus",
    // ... full persona data from spec
  },
  // ... more personas
];

const EMOTIONAL_ARCS_SEED = [
  {
    name: "Confusion → Clarity",
    arc_type: "confusion_to_clarity",
    // ... full arc data from spec
  },
  // ... more arcs
];

const TRAINING_TOPICS_SEED = [
  {
    name: "HSA vs FSA Decision Paralysis",
    topic_key: "hsa_vs_fsa_decision",
    // ... full topic data from spec
  },
  // ... more topics
];

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
}

// Run if executed directly
if (require.main === module) {
  populateScaffoldingData().catch(console.error);
}
```

**Data Extraction Process:**

1. **Read c-alpha-build spec** - Extract persona definitions, arc patterns, topic lists
2. **Read seed conversations** - Validate extracted data against actual usage
3. **Structure data** - Format into database schema
4. **Validate completeness** - Ensure all required fields present
5. **Insert with upsert** - Allow re-running script without duplicates

---

## Testing Requirements

### Unit Tests

**Test Coverage:**
- ScaffoldingDataService: All CRUD operations
- ParameterAssemblyService: Parameter assembly logic, compatibility checking
- TemplateSelectionService: Template selection algorithm, scoring logic

**Location:** `src/lib/services/__tests__/`

### Integration Tests

**Test Scenarios:**
1. Full generation flow: Select scaffolding → Assemble parameters → Generate conversation
2. Compatibility validation: Persona-arc-topic combinations
3. Template selection: Various criteria combinations
4. Error handling: Missing data, invalid parameters

**Location:** `src/app/api/conversations/__tests__/`

### UI Component Tests

**Test Coverage:**
- ScaffoldingSelector: Dropdown rendering, selection handling, compatibility warnings
- Integration with generate page

**Location:** `src/components/conversations/__tests__/`

---

## Migration & Deployment Plan

### Phase 1: Database Setup (Week 1)

1. Create migration files for new tables
2. Execute migrations on development database
3. Run population script to load seed data
4. Validate data integrity and relationships

### Phase 2: Service Layer Implementation (Week 1-2)

1. Implement ScaffoldingDataService
2. Implement ParameterAssemblyService
3. Implement TemplateSelectionService
4. Unit test all services

### Phase 3: API Development (Week 2)

1. Create API endpoints for scaffolding data retrieval
2. Create generation endpoint with scaffolding integration
3. Integration test API flows

### Phase 4: UI Integration (Week 2-3)

1. Build ScaffoldingSelector component
2. Update /conversations/generate page
3. Test end-to-end user workflow

### Phase 5: Testing & Refinement (Week 3-4)

1. Generate 20+ test conversations
2. Validate quality matches seed (4.5+ average)
3. Refine compatibility checking logic
4. Performance optimization

### Phase 6: Documentation & Handoff (Week 4)

1. Complete API documentation
2. Write user guide for scaffolding selection
3. Document data extraction process
4. Create troubleshooting guide

---

## Success Criteria

**POC Complete When:**

1. ✅ All three scaffolding tables created and populated
2. ✅ Service layer fully functional and tested
3. ✅ UI updated with scaffolding selectors
4. ✅ Generation endpoint working with scaffolding integration
5. ✅ 10+ test conversations generated with 4.5+ average quality
6. ✅ Compatibility checking functional with helpful warnings
7. ✅ Documentation complete for developers and users

---

## Appendix A: Complete Scaffolding Data Extraction

*Note: This section will be completed during implementation with full data extracted from specifications.*

**Personas to Extract:**
1. Marcus-type: Overwhelmed Avoider
2. Jennifer-type: Anxious Planner
3. David-type: Pragmatic Optimist
4. (Additional personas from seed conversations)

**Emotional Arcs to Extract:**
1. Confusion → Clarity
2. Shame → Acceptance
3. Couple Conflict → Alignment
4. Fear → Confidence
5. Overwhelm → Empowerment

**Training Topics to Extract:**
- 10 topics from Template A (Confusion→Clarity)
- 8 topics from Template B (Shame→Acceptance)
- 8 topics from Template C (Couple Conflict→Alignment)
- (Additional topics from remaining templates)

---

## Appendix B: Future Enhancement Pathways

**Phase 2 Enhancements (Medium-term):**
- Project layer architecture
- Categories/chunks to scaffolding mapping
- Batch processing from categorized content
- Suggestion engine for parameter pre-population

**Phase 3 Enhancements (Long-term):**
- CRUD UIs for scaffolding management
- CSV import/export
- AI-assisted scaffolding gap analysis
- Quality learning loop
- Multi-domain support

---

**Document Status:** Technical specification complete, ready for implementation
**Related Documents:**
- `04-categories-to-conversation-strategic-overview_v1.md` (Strategic foundation)
- `04-categories-to-conversation-templates_spec_v1.md` (Templates upgrade spec)
