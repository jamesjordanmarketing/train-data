# Training Data Generation Module - Functional Requirements v1

**Version:** 1.0.0
**Date:** January 2025
**Scope:** Training Data Conversation Generation Module
**Based on:** LoRA Financial Planning Training Dataset Specifications

**Source References:**
- Seed Story: `pmc/product\_seeds/seed-narrative-v1-training-data_v1.md`
- Overview Document: `pmc/product/01-bmo-overview.md`
- Specification: `pmc/context-ai/pmct/c-alpha-build_v3.4-LoRA-FP-100-spec.md`
- Dataset Summary: `pmc/context-ai/pmct/training-data-seed-instructions/c-alpha-build_v3.4-LoRA-FP-COMPLETE-DATASET-SUMMARY.md`
- Existing Codebase: `src/` (Next.js 14 + TypeScript + Supabase)

---

## Executive Summary

This document defines the functional requirements for the **Training Data Generation Module** - a comprehensive UI system that enables users to generate, manage, and organize high-quality training conversations for LoRA fine-tuning. The module transforms the manual process of generating 100 conversations into a streamlined, database-driven workflow with intelligent filtering, batch processing, and quality control.

**Key Innovation:** This module solves the critical problem of generating large-scale training datasets by:
1. **Migrating existing seed conversations** (1-10) from JSON files to Supabase database
2. **Creating a filterable conversation matrix** showing all 100 planned conversations with metadata
3. **Enabling selective generation** - generate one, multiple, or all remaining conversations (11-100)
4. **Tracking generation progress** with status indicators and quality metrics
5. **Providing template-based prompts** for three-tier generation (Template, Scenario, Edge Case)

---

## Module Scope Definition

### In Scope - Training Data Generation Module

**Core Features:**
- Database schema design for storing conversations, turns, and metadata
- SQL migration scripts to create all required tables
- Migration of 10 existing seed conversations from JSON to database
- Conversation matrix UI with table-based display
- Multi-dimensional filtering system (persona, tier, emotion, topic, etc.)
- Individual conversation generation with Claude API integration
- Batch conversation generation with sequential processing
- "Process All" functionality for remaining conversations
- Generation status tracking and progress indicators
- Quality metrics and validation tracking
- Integration with existing Next.js 14 + TypeScript + Supabase codebase

**Database Tables:**
- `training_conversations` - Master conversation records
- `training_turns` - Individual conversation turns with full annotation
- `emotional_context` - Emotional analysis data per turn
- `response_strategies` - Strategy and technique metadata per turn
- `response_breakdowns` - Sentence-by-sentence analysis
- `conversation_templates` - Three-tier generation templates
- `generation_jobs` - Processing queue and status tracking
- `quality_metrics` - Quality scores and validation data

**User Interface Components:**
- Conversation matrix table with filtering
- Conversation detail panel with metadata display
- Generation control panel (single, batch, all)
- Progress tracking dashboard
- Quality metrics visualization
- Template management interface

### Out of Scope - Future Integrations

**Not included in this module:**
- User authentication and account management (already exists in codebase)
- Document upload and content processing (separate module)
- AI model training execution
- Model deployment and hosting
- Advanced analytics and reporting dashboards
- Export to external training platforms
- Collaborative review workflows (future phase)

---

## Database Schema Design

### Overview

The database schema is designed to:
1. **Preserve full fidelity** of the existing JSON structure
2. **Enable efficient querying** for conversation filtering and generation
3. **Track generation progress** and quality metrics
4. **Support three-tier template system** for conversation generation
5. **Maintain referential integrity** across all related data

### Schema Diagram

```
training_conversations (1) ──< (many) training_turns
                        │
                        └──< (many) generation_jobs

training_turns (1) ──< (1) emotional_context
              (1) ──< (1) response_strategies
              (1) ──< (many) response_breakdowns

conversation_templates (1) ──< (many) training_conversations
```

### Detailed Table Specifications

#### 1. training_conversations

Master table for conversation records.

```sql
CREATE TABLE training_conversations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Conversation Identification
  conversation_id VARCHAR(50) UNIQUE NOT NULL, -- e.g., "fp_marcus_002"
  conversation_number INTEGER NOT NULL,        -- 1-100

  -- Metadata
  persona_type VARCHAR(50) NOT NULL,           -- "Marcus", "Jennifer", "David"
  persona_name VARCHAR(100) NOT NULL,          -- "Marcus Thompson"
  persona_description TEXT,                    -- Full persona background

  -- Topic & Classification
  topic_category VARCHAR(100) NOT NULL,        -- "RSUs confusion", "Debt shame", etc.
  topic_description TEXT,                      -- Detailed topic description

  -- Three-Tier Classification
  tier VARCHAR(20) NOT NULL,                   -- "tier1_template", "tier2_scenario", "tier3_edge"
  tier_template VARCHAR(100),                  -- "confusion_to_clarity", "shame_to_acceptance", etc.
  tier_batch INTEGER,                          -- Batch number (1-16)

  -- Emotional Arc
  starting_emotion VARCHAR(50),                -- "Confusion", "Shame", etc.
  starting_emotion_intensity DECIMAL(3,2),     -- 0.00-1.00
  ending_emotion VARCHAR(50),                  -- "Clarity", "Acceptance", etc.
  ending_emotion_intensity DECIMAL(3,2),       -- 0.00-1.00
  emotional_arc_description TEXT,              -- Full arc description

  -- Conversation Structure
  turn_count INTEGER NOT NULL,                 -- 3-6 turns
  total_sentences INTEGER,                     -- Total sentences across all turns
  total_word_count INTEGER,                    -- Total words

  -- Session Context
  session_context TEXT,                        -- e.g., "Late evening (10:47 PM)"
  conversation_phase VARCHAR(100),             -- "initial_frustration_expression"
  expected_outcome TEXT,                       -- What this conversation should achieve

  -- Quality Metrics
  quality_score DECIMAL(2,1),                  -- 1.0-5.0
  empathy_score DECIMAL(2,1),                  -- 1.0-5.0
  clarity_score DECIMAL(2,1),                  -- 1.0-5.0
  appropriateness_score DECIMAL(2,1),          -- 1.0-5.0
  brand_voice_score DECIMAL(2,1),              -- 1.0-5.0
  domain_specific_score DECIMAL(2,1),          -- 1.0-5.0

  -- Generation Metadata
  generation_status VARCHAR(20) DEFAULT 'planned', -- 'planned', 'in_progress', 'generated', 'reviewed', 'approved'
  generation_method VARCHAR(50),               -- 'manual', 'claude_api', 'batch_process'
  generation_date TIMESTAMPTZ,                 -- When generated
  generation_duration_seconds INTEGER,         -- How long generation took
  generation_cost_cents INTEGER,               -- API cost in cents

  -- Seed Data Flags
  is_seed_example BOOLEAN DEFAULT false,       -- Is this a Phase 1 seed conversation?
  use_for_variations BOOLEAN DEFAULT false,    -- Should this be used to generate variations?
  variation_count_target INTEGER,              -- How many variations to generate (15-25)

  -- Reviewer Metadata
  human_reviewed BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  review_date TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- Constraints
  CONSTRAINT valid_conversation_number CHECK (conversation_number BETWEEN 1 AND 100),
  CONSTRAINT valid_tier CHECK (tier IN ('tier1_template', 'tier2_scenario', 'tier3_edge')),
  CONSTRAINT valid_generation_status CHECK (generation_status IN ('planned', 'in_progress', 'generated', 'reviewed', 'approved')),
  CONSTRAINT valid_quality_scores CHECK (
    quality_score BETWEEN 1.0 AND 5.0 AND
    empathy_score BETWEEN 1.0 AND 5.0 AND
    clarity_score BETWEEN 1.0 AND 5.0 AND
    appropriateness_score BETWEEN 1.0 AND 5.0 AND
    brand_voice_score BETWEEN 1.0 AND 5.0
  )
);

-- Indexes
CREATE INDEX idx_conversations_number ON training_conversations(conversation_number);
CREATE INDEX idx_conversations_persona ON training_conversations(persona_type);
CREATE INDEX idx_conversations_tier ON training_conversations(tier);
CREATE INDEX idx_conversations_status ON training_conversations(generation_status);
CREATE INDEX idx_conversations_topic ON training_conversations(topic_category);
CREATE INDEX idx_conversations_is_seed ON training_conversations(is_seed_example);

-- Row Level Security
ALTER TABLE training_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read conversations"
  ON training_conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert conversations"
  ON training_conversations FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow users to update their own conversations"
  ON training_conversations FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());
```

#### 2. training_turns

Individual turns within each conversation with full annotation.

```sql
CREATE TABLE training_turns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Turn Identification
  turn_id VARCHAR(50) UNIQUE NOT NULL,         -- e.g., "fp_marcus_002_turn1"
  conversation_id UUID NOT NULL REFERENCES training_conversations(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,                -- 1-6

  -- System Prompt
  system_prompt TEXT NOT NULL,                 -- Elena's system prompt for this turn

  -- User Input
  user_input TEXT NOT NULL,                    -- What the user said
  user_intent VARCHAR(100),                    -- "seeking_basic_guidance", "express_core_fear", etc.

  -- Target Response (Elena's reply)
  target_response TEXT NOT NULL,               -- The gold-standard response to learn
  target_response_word_count INTEGER,
  target_response_sentence_count INTEGER,

  -- Response Structure
  response_structure_type VARCHAR(100),        -- Description of response pattern

  -- Expected User Response Patterns
  positive_indicators JSONB,                   -- Array of positive response patterns
  neutral_indicators JSONB,                    -- Array of neutral response patterns
  negative_indicators JSONB,                   -- Array of negative response patterns

  -- Training Metadata
  difficulty_level VARCHAR(50),                -- "beginner", "intermediate", "advanced"
  key_learning_objective TEXT,                 -- What this turn teaches
  demonstrates_skills JSONB,                   -- Array of skills (4-8 items)
  emotional_progression_target TEXT,           -- What emotional shift should occur

  -- Conversation History (for turns 2+)
  conversation_history JSONB,                  -- Array of previous turns

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_turn_number CHECK (turn_number BETWEEN 1 AND 6),
  CONSTRAINT unique_conversation_turn UNIQUE (conversation_id, turn_number)
);

-- Indexes
CREATE INDEX idx_turns_conversation ON training_turns(conversation_id);
CREATE INDEX idx_turns_turn_number ON training_turns(turn_number);
CREATE INDEX idx_turns_difficulty ON training_turns(difficulty_level);

-- Row Level Security
ALTER TABLE training_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read turns"
  ON training_turns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert turns"
  ON training_turns FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

#### 3. emotional_context

Detailed emotional analysis for each turn.

```sql
CREATE TABLE emotional_context (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES training_turns(id) ON DELETE CASCADE,

  -- Detected Emotions
  primary_emotion VARCHAR(50) NOT NULL,
  primary_confidence DECIMAL(3,2) NOT NULL,    -- 0.00-1.00
  secondary_emotion VARCHAR(50),
  secondary_confidence DECIMAL(3,2),
  tertiary_emotion VARCHAR(50),
  tertiary_confidence DECIMAL(3,2),
  intensity DECIMAL(3,2) NOT NULL,             -- 0.00-1.00
  valence VARCHAR(20) NOT NULL,                -- "positive", "negative", "mixed"

  -- Emotional Indicators (JSONB for flexibility)
  explicit_emotion_words JSONB,                -- Array of specific emotion words found
  uncertainty_language JSONB,                  -- Examples of uncertainty
  self_deprecation JSONB,                      -- Self-deprecating phrases
  time_pressure JSONB,                         -- Time pressure indicators
  social_comparison JSONB,                     -- Comparison to others
  decision_paralysis JSONB,                    -- Choice paralysis indicators
  vulnerability JSONB,                         -- Vulnerability markers
  enthusiasm JSONB,                            -- Enthusiasm indicators

  -- Emotional Progression (for turns 2+)
  previous_turn_emotion VARCHAR(50),
  current_turn_emotion VARCHAR(50),
  progression_description TEXT,
  intensity_change DECIMAL(3,2),               -- -1.00 to 1.00 (change from previous)

  -- Behavioral Assessment
  risk_level VARCHAR(100),                     -- e.g., "medium_couple_tension_could_escalate"
  engagement_readiness VARCHAR(100),           -- e.g., "high_seeking_resolution"
  knowledge_level VARCHAR(100),                -- e.g., "aware_of_conventional_wisdom_but_conflicted"
  trust_level VARCHAR(100),                    -- e.g., "building_direct_and_honest"

  -- Client Needs (JSONB array of priority objects)
  client_needs JSONB NOT NULL,                 -- [{priority: 1, need: "...", rationale: "..."}, ...]

  -- Red Flags (JSONB array)
  red_flags JSONB,                             -- [{flag: "...", implication: "...", handling: "..."}, ...]

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_turn_emotional_context UNIQUE (turn_id),
  CONSTRAINT valid_confidence_scores CHECK (
    primary_confidence BETWEEN 0.00 AND 1.00 AND
    (secondary_confidence IS NULL OR secondary_confidence BETWEEN 0.00 AND 1.00) AND
    (tertiary_confidence IS NULL OR tertiary_confidence BETWEEN 0.00 AND 1.00)
  ),
  CONSTRAINT valid_valence CHECK (valence IN ('positive', 'negative', 'mixed'))
);

-- Indexes
CREATE INDEX idx_emotional_context_turn ON emotional_context(turn_id);
CREATE INDEX idx_emotional_context_primary ON emotional_context(primary_emotion);
CREATE INDEX idx_emotional_context_valence ON emotional_context(valence);

-- Row Level Security
ALTER TABLE emotional_context ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read emotional context"
  ON emotional_context FOR SELECT
  TO authenticated
  USING (true);
```

#### 4. response_strategies

Response strategy and technique metadata for each turn.

```sql
CREATE TABLE response_strategies (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES training_turns(id) ON DELETE CASCADE,

  -- Primary Strategy
  primary_strategy VARCHAR(100) NOT NULL,      -- e.g., "validate_frustration_then_challenge_false_dichotomy"
  primary_rationale TEXT NOT NULL,             -- 2-3 sentences explaining WHY

  -- Secondary Strategies (JSONB array)
  secondary_strategies JSONB,                  -- ["normalize_couple_money_disagreements", "ask_for_specifics"]

  -- Tone
  tone_selection VARCHAR(50) NOT NULL,         -- "empathetic_and_practical"
  tone_rationale TEXT,                         -- Why this tone

  -- Pacing
  pacing VARCHAR(20) NOT NULL,                 -- "slow", "moderate", "fast"

  -- Tactical Choices (JSONB object)
  tactical_choices JSONB NOT NULL,             -- {validate_both_perspectives: true, normalize_newlywed_money_tension: true, ...}

  -- Avoid Tactics (JSONB array)
  avoid_tactics JSONB,                         -- ["taking_sides_between_couple", "dismissing_debt_concern", ...]

  -- Specific Techniques (JSONB array of objects)
  specific_techniques JSONB NOT NULL,          -- [{technique: "...", application: "...", purpose: "..."}, ...]

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_turn_response_strategy UNIQUE (turn_id),
  CONSTRAINT valid_pacing CHECK (pacing IN ('slow', 'moderate', 'fast'))
);

-- Indexes
CREATE INDEX idx_response_strategies_turn ON response_strategies(turn_id);
CREATE INDEX idx_response_strategies_primary ON response_strategies(primary_strategy);

-- Row Level Security
ALTER TABLE response_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read response strategies"
  ON response_strategies FOR SELECT
  TO authenticated
  USING (true);
```

#### 5. response_breakdowns

Sentence-by-sentence analysis of target responses.

```sql
CREATE TABLE response_breakdowns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES training_turns(id) ON DELETE CASCADE,

  -- Sentence Identification
  sentence_number INTEGER NOT NULL,
  sentence_text TEXT NOT NULL,

  -- Analysis
  function VARCHAR(100) NOT NULL,              -- What this sentence does
  emotional_purpose VARCHAR(100) NOT NULL,     -- Emotional goal
  technique VARCHAR(100) NOT NULL,             -- Technique used
  teaches_model TEXT NOT NULL,                 -- What AI should learn

  -- Word Choice Rationale (JSONB object with 3-6 key phrases)
  word_choice_rationale JSONB NOT NULL,        -- {"phrase": "why it works", ...}

  -- Optional Metadata
  psychological_principle VARCHAR(200),         -- If applicable
  stylistic_note TEXT,                         -- Formatting, emphasis notes

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_turn_sentence UNIQUE (turn_id, sentence_number)
);

-- Indexes
CREATE INDEX idx_response_breakdowns_turn ON response_breakdowns(turn_id);
CREATE INDEX idx_response_breakdowns_sentence_num ON response_breakdowns(sentence_number);

-- Row Level Security
ALTER TABLE response_breakdowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read response breakdowns"
  ON response_breakdowns FOR SELECT
  TO authenticated
  USING (true);
```

#### 6. conversation_templates

Three-tier template system for generating conversations.

```sql
CREATE TABLE conversation_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template Identification
  template_id VARCHAR(50) UNIQUE NOT NULL,     -- e.g., "tier1_template_a"
  template_name VARCHAR(200) NOT NULL,         -- "Tier 1 Template A - Confusion→Clarity"

  -- Tier Classification
  tier VARCHAR(20) NOT NULL,                   -- "tier1_template", "tier2_scenario", "tier3_edge"
  tier_description TEXT,

  -- Emotional Arc Pattern (for tier1 templates)
  emotional_arc_pattern VARCHAR(100),          -- "confusion_to_clarity", "shame_to_acceptance", etc.
  starting_emotion_pattern VARCHAR(50),
  ending_emotion_pattern VARCHAR(50),

  -- Structural Pattern
  typical_turn_count INTEGER,                  -- 3-5 turns typical
  structural_pattern_description TEXT,         -- Description of turn pattern

  -- Template Content
  template_prompt TEXT NOT NULL,               -- The full prompt for Claude to generate conversations
  template_instructions TEXT,                  -- Special instructions for using this template

  -- Reference Examples
  reference_conversation_ids JSONB,            -- Array of conversation IDs that exemplify this template

  -- Generation Metadata
  target_conversation_count INTEGER,           -- How many conversations use this template
  generated_conversation_count INTEGER DEFAULT 0,

  -- Quality Requirements
  quality_requirements JSONB,                  -- Special quality criteria for this template type

  -- Active Status
  is_active BOOLEAN DEFAULT true,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_tier CHECK (tier IN ('tier1_template', 'tier2_scenario', 'tier3_edge'))
);

-- Indexes
CREATE INDEX idx_templates_tier ON conversation_templates(tier);
CREATE INDEX idx_templates_active ON conversation_templates(is_active);

-- Row Level Security
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read templates"
  ON conversation_templates FOR SELECT
  TO authenticated
  USING (true);
```

#### 7. generation_jobs

Processing queue and status tracking for conversation generation.

```sql
CREATE TABLE generation_jobs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Job Identification
  job_type VARCHAR(50) NOT NULL,               -- 'single', 'batch', 'process_all'

  -- Conversations to Generate
  target_conversation_ids JSONB NOT NULL,      -- Array of conversation IDs to generate
  total_conversations INTEGER NOT NULL,

  -- Template Reference
  template_id UUID REFERENCES conversation_templates(id),

  -- Progress Tracking
  status VARCHAR(20) DEFAULT 'queued',         -- 'queued', 'in_progress', 'completed', 'failed', 'cancelled'
  current_conversation_index INTEGER DEFAULT 0,
  completed_conversations INTEGER DEFAULT 0,
  failed_conversations INTEGER DEFAULT 0,

  -- Processing Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_duration_seconds INTEGER,

  -- Cost Tracking
  total_api_calls INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,

  -- Error Handling
  error_message TEXT,
  failed_conversation_ids JSONB,               -- Array of conversation IDs that failed

  -- Results Summary
  results_summary JSONB,                       -- {conversation_id: {status, quality_score, duration, ...}}

  -- User Association
  created_by UUID REFERENCES auth.users(id),

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_job_type CHECK (job_type IN ('single', 'batch', 'process_all')),
  CONSTRAINT valid_status CHECK (status IN ('queued', 'in_progress', 'completed', 'failed', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX idx_generation_jobs_created_by ON generation_jobs(created_by);
CREATE INDEX idx_generation_jobs_created_at ON generation_jobs(created_at DESC);

-- Row Level Security
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read their own jobs"
  ON generation_jobs FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Allow users to create jobs"
  ON generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Allow users to update their own jobs"
  ON generation_jobs FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());
```

#### 8. quality_metrics

Aggregated quality metrics and validation tracking.

```sql
CREATE TABLE quality_metrics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES training_conversations(id) ON DELETE CASCADE,

  -- Overall Metrics
  total_turns INTEGER NOT NULL,
  total_sentences INTEGER NOT NULL,
  total_word_count INTEGER NOT NULL,
  average_words_per_sentence DECIMAL(5,1),

  -- Quality Scores
  overall_quality_score DECIMAL(2,1) NOT NULL,
  empathy_score DECIMAL(2,1) NOT NULL,
  clarity_score DECIMAL(2,1) NOT NULL,
  appropriateness_score DECIMAL(2,1) NOT NULL,
  brand_voice_alignment DECIMAL(2,1) NOT NULL,

  -- Emotional Analysis Completeness
  has_complete_emotional_context BOOLEAN DEFAULT false,
  has_emotional_progression BOOLEAN DEFAULT false,
  emotional_indicator_count INTEGER,

  -- Response Strategy Completeness
  has_primary_strategy BOOLEAN DEFAULT false,
  has_strategy_rationale BOOLEAN DEFAULT false,
  technique_count INTEGER,

  -- Sentence Analysis Completeness
  sentences_analyzed INTEGER,
  sentences_with_word_rationale INTEGER,
  word_choice_rationale_completeness DECIMAL(3,2), -- Percentage

  -- Validation Flags
  all_required_fields_complete BOOLEAN DEFAULT false,
  ready_for_training BOOLEAN DEFAULT false,
  needs_review BOOLEAN DEFAULT false,

  -- Reviewer Assessment
  reviewer_approved BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  review_date TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_conversation_metrics UNIQUE (conversation_id),
  CONSTRAINT valid_quality_scores CHECK (
    overall_quality_score BETWEEN 1.0 AND 5.0 AND
    empathy_score BETWEEN 1.0 AND 5.0 AND
    clarity_score BETWEEN 1.0 AND 5.0 AND
    appropriateness_score BETWEEN 1.0 AND 5.0 AND
    brand_voice_alignment BETWEEN 1.0 AND 5.0
  )
);

-- Indexes
CREATE INDEX idx_quality_metrics_conversation ON quality_metrics(conversation_id);
CREATE INDEX idx_quality_metrics_ready_for_training ON quality_metrics(ready_for_training);
CREATE INDEX idx_quality_metrics_needs_review ON quality_metrics(needs_review);

-- Row Level Security
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read quality metrics"
  ON quality_metrics FOR SELECT
  TO authenticated
  USING (true);
```

---

## SQL Migration Script

The following script creates all tables and prepares the database for the Training Data Module:

=========================



```sql
-- ============================================================================
-- TRAINING DATA MODULE - DATABASE MIGRATION SCRIPT
-- Version: 1.0.0
-- Description: Creates all tables for training conversation management
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: training_conversations
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_conversations (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Conversation Identification
  conversation_id VARCHAR(50) UNIQUE NOT NULL,
  conversation_number INTEGER NOT NULL,

  -- Metadata
  persona_type VARCHAR(50) NOT NULL,
  persona_name VARCHAR(100) NOT NULL,
  persona_description TEXT,

  -- Topic & Classification
  topic_category VARCHAR(100) NOT NULL,
  topic_description TEXT,

  -- Three-Tier Classification
  tier VARCHAR(20) NOT NULL,
  tier_template VARCHAR(100),
  tier_batch INTEGER,

  -- Emotional Arc
  starting_emotion VARCHAR(50),
  starting_emotion_intensity DECIMAL(3,2),
  ending_emotion VARCHAR(50),
  ending_emotion_intensity DECIMAL(3,2),
  emotional_arc_description TEXT,

  -- Conversation Structure
  turn_count INTEGER NOT NULL,
  total_sentences INTEGER,
  total_word_count INTEGER,

  -- Session Context
  session_context TEXT,
  conversation_phase VARCHAR(100),
  expected_outcome TEXT,

  -- Quality Metrics
  quality_score DECIMAL(2,1),
  empathy_score DECIMAL(2,1),
  clarity_score DECIMAL(2,1),
  appropriateness_score DECIMAL(2,1),
  brand_voice_score DECIMAL(2,1),
  domain_specific_score DECIMAL(2,1),

  -- Generation Metadata
  generation_status VARCHAR(20) DEFAULT 'planned',
  generation_method VARCHAR(50),
  generation_date TIMESTAMPTZ,
  generation_duration_seconds INTEGER,
  generation_cost_cents INTEGER,

  -- Seed Data Flags
  is_seed_example BOOLEAN DEFAULT false,
  use_for_variations BOOLEAN DEFAULT false,
  variation_count_target INTEGER,

  -- Reviewer Metadata
  human_reviewed BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  review_date TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,

  -- Constraints
  CONSTRAINT valid_conversation_number CHECK (conversation_number BETWEEN 1 AND 100),
  CONSTRAINT valid_tier CHECK (tier IN ('tier1_template', 'tier2_scenario', 'tier3_edge')),
  CONSTRAINT valid_generation_status CHECK (generation_status IN ('planned', 'in_progress', 'generated', 'reviewed', 'approved')),
  CONSTRAINT valid_quality_scores CHECK (
    quality_score IS NULL OR (quality_score BETWEEN 1.0 AND 5.0 AND
    empathy_score BETWEEN 1.0 AND 5.0 AND
    clarity_score BETWEEN 1.0 AND 5.0 AND
    appropriateness_score BETWEEN 1.0 AND 5.0 AND
    brand_voice_score BETWEEN 1.0 AND 5.0)
  )
);

-- Indexes for training_conversations
CREATE INDEX IF NOT EXISTS idx_conversations_number ON training_conversations(conversation_number);
CREATE INDEX IF NOT EXISTS idx_conversations_persona ON training_conversations(persona_type);
CREATE INDEX IF NOT EXISTS idx_conversations_tier ON training_conversations(tier);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON training_conversations(generation_status);
CREATE INDEX IF NOT EXISTS idx_conversations_topic ON training_conversations(topic_category);
CREATE INDEX IF NOT EXISTS idx_conversations_is_seed ON training_conversations(is_seed_example);

-- Row Level Security for training_conversations
ALTER TABLE training_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read conversations" ON training_conversations;
CREATE POLICY "Allow authenticated users to read conversations"
  ON training_conversations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert conversations" ON training_conversations;
CREATE POLICY "Allow authenticated users to insert conversations"
  ON training_conversations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update conversations" ON training_conversations;
CREATE POLICY "Allow users to update conversations"
  ON training_conversations FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- TABLE 2: training_turns
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_turns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Turn Identification
  turn_id VARCHAR(50) UNIQUE NOT NULL,
  conversation_id UUID NOT NULL REFERENCES training_conversations(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,

  -- System Prompt
  system_prompt TEXT NOT NULL,

  -- User Input
  user_input TEXT NOT NULL,
  user_intent VARCHAR(100),

  -- Target Response (Elena's reply)
  target_response TEXT NOT NULL,
  target_response_word_count INTEGER,
  target_response_sentence_count INTEGER,

  -- Response Structure
  response_structure_type VARCHAR(100),

  -- Expected User Response Patterns
  positive_indicators JSONB,
  neutral_indicators JSONB,
  negative_indicators JSONB,

  -- Training Metadata
  difficulty_level VARCHAR(50),
  key_learning_objective TEXT,
  demonstrates_skills JSONB,
  emotional_progression_target TEXT,

  -- Conversation History (for turns 2+)
  conversation_history JSONB,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_turn_number CHECK (turn_number BETWEEN 1 AND 6),
  CONSTRAINT unique_conversation_turn UNIQUE (conversation_id, turn_number)
);

-- Indexes for training_turns
CREATE INDEX IF NOT EXISTS idx_turns_conversation ON training_turns(conversation_id);
CREATE INDEX IF NOT EXISTS idx_turns_turn_number ON training_turns(turn_number);
CREATE INDEX IF NOT EXISTS idx_turns_difficulty ON training_turns(difficulty_level);

-- Row Level Security for training_turns
ALTER TABLE training_turns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read turns" ON training_turns;
CREATE POLICY "Allow authenticated users to read turns"
  ON training_turns FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert turns" ON training_turns;
CREATE POLICY "Allow authenticated users to insert turns"
  ON training_turns FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TABLE 3: emotional_context
-- ============================================================================

CREATE TABLE IF NOT EXISTS emotional_context (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES training_turns(id) ON DELETE CASCADE,

  -- Detected Emotions
  primary_emotion VARCHAR(50) NOT NULL,
  primary_confidence DECIMAL(3,2) NOT NULL,
  secondary_emotion VARCHAR(50),
  secondary_confidence DECIMAL(3,2),
  tertiary_emotion VARCHAR(50),
  tertiary_confidence DECIMAL(3,2),
  intensity DECIMAL(3,2) NOT NULL,
  valence VARCHAR(20) NOT NULL,

  -- Emotional Indicators (JSONB for flexibility)
  explicit_emotion_words JSONB,
  uncertainty_language JSONB,
  self_deprecation JSONB,
  time_pressure JSONB,
  social_comparison JSONB,
  decision_paralysis JSONB,
  vulnerability JSONB,
  enthusiasm JSONB,

  -- Emotional Progression (for turns 2+)
  previous_turn_emotion VARCHAR(50),
  current_turn_emotion VARCHAR(50),
  progression_description TEXT,
  intensity_change DECIMAL(3,2),

  -- Behavioral Assessment
  risk_level VARCHAR(100),
  engagement_readiness VARCHAR(100),
  knowledge_level VARCHAR(100),
  trust_level VARCHAR(100),

  -- Client Needs (JSONB array of priority objects)
  client_needs JSONB NOT NULL,

  -- Red Flags (JSONB array)
  red_flags JSONB,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_turn_emotional_context UNIQUE (turn_id),
  CONSTRAINT valid_confidence_scores CHECK (
    primary_confidence BETWEEN 0.00 AND 1.00 AND
    (secondary_confidence IS NULL OR secondary_confidence BETWEEN 0.00 AND 1.00) AND
    (tertiary_confidence IS NULL OR tertiary_confidence BETWEEN 0.00 AND 1.00)
  ),
  CONSTRAINT valid_valence CHECK (valence IN ('positive', 'negative', 'mixed'))
);

-- Indexes for emotional_context
CREATE INDEX IF NOT EXISTS idx_emotional_context_turn ON emotional_context(turn_id);
CREATE INDEX IF NOT EXISTS idx_emotional_context_primary ON emotional_context(primary_emotion);
CREATE INDEX IF NOT EXISTS idx_emotional_context_valence ON emotional_context(valence);

-- Row Level Security for emotional_context
ALTER TABLE emotional_context ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read emotional context" ON emotional_context;
CREATE POLICY "Allow authenticated users to read emotional context"
  ON emotional_context FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert emotional context" ON emotional_context;
CREATE POLICY "Allow authenticated users to insert emotional context"
  ON emotional_context FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TABLE 4: response_strategies
-- ============================================================================

CREATE TABLE IF NOT EXISTS response_strategies (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES training_turns(id) ON DELETE CASCADE,

  -- Primary Strategy
  primary_strategy VARCHAR(100) NOT NULL,
  primary_rationale TEXT NOT NULL,

  -- Secondary Strategies (JSONB array)
  secondary_strategies JSONB,

  -- Tone
  tone_selection VARCHAR(50) NOT NULL,
  tone_rationale TEXT,

  -- Pacing
  pacing VARCHAR(20) NOT NULL,

  -- Tactical Choices (JSONB object)
  tactical_choices JSONB NOT NULL,

  -- Avoid Tactics (JSONB array)
  avoid_tactics JSONB,

  -- Specific Techniques (JSONB array of objects)
  specific_techniques JSONB NOT NULL,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_turn_response_strategy UNIQUE (turn_id),
  CONSTRAINT valid_pacing CHECK (pacing IN ('slow', 'moderate', 'fast'))
);

-- Indexes for response_strategies
CREATE INDEX IF NOT EXISTS idx_response_strategies_turn ON response_strategies(turn_id);
CREATE INDEX IF NOT EXISTS idx_response_strategies_primary ON response_strategies(primary_strategy);

-- Row Level Security for response_strategies
ALTER TABLE response_strategies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read response strategies" ON response_strategies;
CREATE POLICY "Allow authenticated users to read response strategies"
  ON response_strategies FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert response strategies" ON response_strategies;
CREATE POLICY "Allow authenticated users to insert response strategies"
  ON response_strategies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TABLE 5: response_breakdowns
-- ============================================================================

CREATE TABLE IF NOT EXISTS response_breakdowns (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  turn_id UUID NOT NULL REFERENCES training_turns(id) ON DELETE CASCADE,

  -- Sentence Identification
  sentence_number INTEGER NOT NULL,
  sentence_text TEXT NOT NULL,

  -- Analysis
  function VARCHAR(100) NOT NULL,
  emotional_purpose VARCHAR(100) NOT NULL,
  technique VARCHAR(100) NOT NULL,
  teaches_model TEXT NOT NULL,

  -- Word Choice Rationale (JSONB object with 3-6 key phrases)
  word_choice_rationale JSONB NOT NULL,

  -- Optional Metadata
  psychological_principle VARCHAR(200),
  stylistic_note TEXT,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_turn_sentence UNIQUE (turn_id, sentence_number)
);

-- Indexes for response_breakdowns
CREATE INDEX IF NOT EXISTS idx_response_breakdowns_turn ON response_breakdowns(turn_id);
CREATE INDEX IF NOT EXISTS idx_response_breakdowns_sentence_num ON response_breakdowns(sentence_number);

-- Row Level Security for response_breakdowns
ALTER TABLE response_breakdowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read response breakdowns" ON response_breakdowns;
CREATE POLICY "Allow authenticated users to read response breakdowns"
  ON response_breakdowns FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert response breakdowns" ON response_breakdowns;
CREATE POLICY "Allow authenticated users to insert response breakdowns"
  ON response_breakdowns FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- TABLE 6: conversation_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversation_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template Identification
  template_id VARCHAR(50) UNIQUE NOT NULL,
  template_name VARCHAR(200) NOT NULL,

  -- Tier Classification
  tier VARCHAR(20) NOT NULL,
  tier_description TEXT,

  -- Emotional Arc Pattern (for tier1 templates)
  emotional_arc_pattern VARCHAR(100),
  starting_emotion_pattern VARCHAR(50),
  ending_emotion_pattern VARCHAR(50),

  -- Structural Pattern
  typical_turn_count INTEGER,
  structural_pattern_description TEXT,

  -- Template Content
  template_prompt TEXT NOT NULL,
  template_instructions TEXT,

  -- Reference Examples
  reference_conversation_ids JSONB,

  -- Generation Metadata
  target_conversation_count INTEGER,
  generated_conversation_count INTEGER DEFAULT 0,

  -- Quality Requirements
  quality_requirements JSONB,

  -- Active Status
  is_active BOOLEAN DEFAULT true,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_tier CHECK (tier IN ('tier1_template', 'tier2_scenario', 'tier3_edge'))
);

-- Indexes for conversation_templates
CREATE INDEX IF NOT EXISTS idx_templates_tier ON conversation_templates(tier);
CREATE INDEX IF NOT EXISTS idx_templates_active ON conversation_templates(is_active);

-- Row Level Security for conversation_templates
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read templates" ON conversation_templates;
CREATE POLICY "Allow authenticated users to read templates"
  ON conversation_templates FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- TABLE 7: generation_jobs
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_jobs (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Job Identification
  job_type VARCHAR(50) NOT NULL,

  -- Conversations to Generate
  target_conversation_ids JSONB NOT NULL,
  total_conversations INTEGER NOT NULL,

  -- Template Reference
  template_id UUID REFERENCES conversation_templates(id),

  -- Progress Tracking
  status VARCHAR(20) DEFAULT 'queued',
  current_conversation_index INTEGER DEFAULT 0,
  completed_conversations INTEGER DEFAULT 0,
  failed_conversations INTEGER DEFAULT 0,

  -- Processing Metadata
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  total_duration_seconds INTEGER,

  -- Cost Tracking
  total_api_calls INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  total_cost_cents INTEGER DEFAULT 0,

  -- Error Handling
  error_message TEXT,
  failed_conversation_ids JSONB,

  -- Results Summary
  results_summary JSONB,

  -- User Association
  created_by UUID,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_job_type CHECK (job_type IN ('single', 'batch', 'process_all')),
  CONSTRAINT valid_status CHECK (status IN ('queued', 'in_progress', 'completed', 'failed', 'cancelled'))
);

-- Indexes for generation_jobs
CREATE INDEX IF NOT EXISTS idx_generation_jobs_status ON generation_jobs(status);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_by ON generation_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_generation_jobs_created_at ON generation_jobs(created_at DESC);

-- Row Level Security for generation_jobs
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read jobs" ON generation_jobs;
CREATE POLICY "Allow users to read jobs"
  ON generation_jobs FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow users to create jobs" ON generation_jobs;
CREATE POLICY "Allow users to create jobs"
  ON generation_jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to update jobs" ON generation_jobs;
CREATE POLICY "Allow users to update jobs"
  ON generation_jobs FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================================================
-- TABLE 8: quality_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS quality_metrics (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES training_conversations(id) ON DELETE CASCADE,

  -- Overall Metrics
  total_turns INTEGER NOT NULL,
  total_sentences INTEGER NOT NULL,
  total_word_count INTEGER NOT NULL,
  average_words_per_sentence DECIMAL(5,1),

  -- Quality Scores
  overall_quality_score DECIMAL(2,1) NOT NULL,
  empathy_score DECIMAL(2,1) NOT NULL,
  clarity_score DECIMAL(2,1) NOT NULL,
  appropriateness_score DECIMAL(2,1) NOT NULL,
  brand_voice_alignment DECIMAL(2,1) NOT NULL,

  -- Emotional Analysis Completeness
  has_complete_emotional_context BOOLEAN DEFAULT false,
  has_emotional_progression BOOLEAN DEFAULT false,
  emotional_indicator_count INTEGER,

  -- Response Strategy Completeness
  has_primary_strategy BOOLEAN DEFAULT false,
  has_strategy_rationale BOOLEAN DEFAULT false,
  technique_count INTEGER,

  -- Sentence Analysis Completeness
  sentences_analyzed INTEGER,
  sentences_with_word_rationale INTEGER,
  word_choice_rationale_completeness DECIMAL(3,2),

  -- Validation Flags
  all_required_fields_complete BOOLEAN DEFAULT false,
  ready_for_training BOOLEAN DEFAULT false,
  needs_review BOOLEAN DEFAULT false,

  -- Reviewer Assessment
  reviewer_approved BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  review_date TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_conversation_metrics UNIQUE (conversation_id),
  CONSTRAINT valid_quality_scores CHECK (
    overall_quality_score BETWEEN 1.0 AND 5.0 AND
    empathy_score BETWEEN 1.0 AND 5.0 AND
    clarity_score BETWEEN 1.0 AND 5.0 AND
    appropriateness_score BETWEEN 1.0 AND 5.0 AND
    brand_voice_alignment BETWEEN 1.0 AND 5.0
  )
);

-- Indexes for quality_metrics
CREATE INDEX IF NOT EXISTS idx_quality_metrics_conversation ON quality_metrics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_ready_for_training ON quality_metrics(ready_for_training);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_needs_review ON quality_metrics(needs_review);

-- Row Level Security for quality_metrics
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated users to read quality metrics" ON quality_metrics;
CREATE POLICY "Allow authenticated users to read quality metrics"
  ON quality_metrics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert quality metrics" ON quality_metrics;
CREATE POLICY "Allow authenticated users to insert quality metrics"
  ON quality_metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify table creation
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'training_conversations',
    'training_turns',
    'emotional_context',
    'response_strategies',
    'response_breakdowns',
    'conversation_templates',
    'generation_jobs',
    'quality_metrics'
  )
ORDER BY table_name;
```



+++++++++++++++

---

*This SQL migration script is ready to be executed in your Supabase database. It creates all 8 tables with proper constraints, indexes, and Row Level Security policies.*

---

## User Stories & Acceptance Criteria

### US-TRAIN-001: View Conversation Matrix

**As a** training data manager
**I want to** view all 100 conversations in a filterable table
**So that** I can understand the complete dataset structure and generation status

**Acceptance Criteria:**
- Display table with columns: #, Conversation ID, Persona, Topic, Tier, Emotional Arc, Turns, Status, Quality Score, Actions
- Show generation status with color-coded badges (Planned, In Progress, Generated, Reviewed, Approved)
- Display quality scores with visual indicators (5-star rating system)
- Show conversation count summary: Total (100), Seed (10), Generated (X), Remaining (Y)
- Provide pagination for large datasets (25, 50, 100 rows per page)
- Support column sorting (by conversation number, persona, status, quality score)
- Display tier distribution: Tier 1 (40), Tier 2 (35), Tier 3 (15)
- Show persona distribution: Marcus (17 convos), Jennifer (14 convos), David (13 convos), Mixed (56 convos)
- Enable row selection with checkboxes for batch operations
- Highlight seed conversations (1-10) with distinct visual treatment

### US-TRAIN-002: Filter Conversations by Dimensions

**As a** training data manager
**I want to** filter conversations using multiple dimensions
**So that** I can focus on specific conversation types for generation

**Acceptance Criteria:**
- **Persona Filter:** Multi-select dropdown (Marcus, Jennifer, David, Mixed)
- **Tier Filter:** Multi-select dropdown (Tier 1 Template, Tier 2 Scenario, Tier 3 Edge)
- **Emotion Filter (Starting):** Multi-select dropdown with all primary emotions (Confusion, Shame, Anxiety, Frustration, etc.)
- **Emotion Filter (Ending):** Multi-select dropdown with target emotions (Clarity, Acceptance, Confidence, etc.)
- **Topic Filter:** Search/filter by topic keywords
- **Status Filter:** Multi-select (Planned, In Progress, Generated, Reviewed, Approved)
- **Quality Score Filter:** Range slider (1.0-5.0)
- **Template Filter:** Dropdown for Tier 1 templates (Template A-E)
- Display active filter count badge
- Show filtered result count vs total count
- Provide "Clear All Filters" button
- Persist filter state in URL query parameters
- Support filter combinations with AND logic

### US-TRAIN-003: Generate Single Conversation

**As a** training data manager
**I want to** generate one conversation at a time
**So that** I can control and review individual conversation creation

**Acceptance Criteria:**
- Display "Generate" button for conversations with status "Planned"
- Click button opens confirmation dialog showing:
  - Conversation details (ID, persona, topic, emotional arc)
  - Template that will be used
  - Estimated generation time (2-5 minutes)
  - Estimated API cost ($0.10-$0.30)
- Upon confirmation, change status to "In Progress"
- Show real-time generation progress with spinner and status messages
- Display generation logs in expandable panel:
  - "Preparing prompt..."
  - "Calling Claude API..."
  - "Processing response..."
  - "Parsing conversation structure..."
  - "Saving turns to database..."
  - "Generating emotional context..."
  - "Creating response strategies..."
  - "Analyzing sentences..."
  - "Calculating quality metrics..."
  - "Generation complete!"
- Upon completion, change status to "Generated"
- Display success notification with quality score
- Auto-refresh table row to show updated status and metrics
- Handle errors gracefully with clear error messages
- Provide "Retry" option if generation fails
- Log all generation metadata (duration, cost, token count)

### US-TRAIN-004: Batch Generate Conversations

**As a** training data manager
**I want to** select multiple conversations and generate them sequentially
**So that** I can efficiently process groups of related conversations

**Acceptance Criteria:**
- Enable row selection with checkboxes
- Display "Generate Selected (X)" button in table header
- Button disabled if no rows selected or all selected are non-Planned status
- Click button opens batch confirmation dialog showing:
  - List of selected conversations with details
  - Total count
  - Estimated total time
  - Estimated total cost
  - Warning: "This will process sequentially to avoid API rate limits"
- Upon confirmation, create generation job record
- Process conversations one at a time in sequence
- Display batch progress dashboard:
  - Overall progress bar (X of Y conversations)
  - Current conversation being processed with live status
  - Completed conversations list with quality scores
  - Failed conversations list with error details
  - Estimated time remaining
  - Total cost accrued
- Update table rows in real-time as each conversation completes
- Show notification when batch completes
- Provide batch summary report:
  - Total conversations processed
  - Success count / failure count
  - Average quality score
  - Total duration
  - Total cost
  - Option to download detailed log
- Handle API rate limiting with automatic retries and backoff
- Support "Pause Batch" and "Cancel Batch" options
- Resume capability for interrupted batches

### US-TRAIN-005: Process All Remaining Conversations

**As a** training data manager
**I want to** generate all remaining conversations with one button
**So that** I can complete the entire dataset efficiently

**Acceptance Criteria:**
- Display "Process All Remaining" button prominently in dashboard header
- Button shows count of remaining conversations: "Process All Remaining (90)"
- Button disabled if all conversations are already generated
- Click button opens comprehensive confirmation dialog:
  - Total remaining conversations grouped by tier:
    - Tier 1 Template: X conversations
    - Tier 2 Scenario: Y conversations
    - Tier 3 Edge Cases: Z conversations
  - Estimated total time: X hours Y minutes
  - Estimated total cost: $XX.XX
  - Processing order: Tier 1 → Tier 2 → Tier 3 (as recommended)
  - Warning: "This is a long-running process. You can close the browser and check back later."
  - Checkbox: "Send email notification when complete"
- Upon confirmation, create master generation job
- Process all conversations in recommended order (templates first, edge cases last)
- Implement robust error handling:
  - Continue to next conversation if one fails
  - Log all failures for review
  - Retry failed conversations up to 3 times
- Display comprehensive progress dashboard:
  - Overall progress: X of 90 conversations
  - Current tier being processed
  - Tier-specific progress bars
  - Recent completions stream (last 10)
  - Error log panel (expandable)
  - Estimated time remaining (dynamically updated)
  - Cost tracker (running total)
  - Pause / Resume controls
- Send real-time progress updates via toast notifications (every 10 conversations)
- Send email notification on completion (if opted in)
- Handle browser close / reconnect gracefully:
  - Job continues in background
  - User can return and see progress
  - No duplicate generations
- Upon completion, display final summary:
  - Total conversations generated: 90
  - Success rate: X%
  - Failed conversations: [list with retry option]
  - Average quality score: X.X/5.0
  - Total duration: X hours Y minutes
  - Total cost: $XX.XX
  - Quality distribution chart
  - Next steps guidance

### US-TRAIN-006: View Conversation Detail

**As a** training data manager
**I want to** view complete conversation details
**So that** I can review content, quality, and metadata

**Acceptance Criteria:**
- Click conversation row opens detail panel (modal or slide-over)
- Display conversation metadata section:
  - Conversation ID, number, persona details
  - Topic and description
  - Tier and template information
  - Emotional arc visualization (start → end)
  - Session context and expected outcome
  - Generation metadata (date, duration, cost)
- Display all turns in expandable accordion:
  - Turn number and user intent
  - User input (formatted text)
  - Elena's target response (formatted text)
  - Emotional context summary
  - Response strategy summary
  - Quality metrics per turn
- Provide detailed analysis tabs:
  - **Emotional Analysis:** Full emotional context data with indicators
  - **Response Strategies:** Strategy breakdown with techniques
  - **Sentence Breakdown:** Every sentence analyzed with word choice rationales
  - **Quality Metrics:** Comprehensive quality assessment
- Show quality scores with visual indicators:
  - Overall quality score (5-star)
  - Dimension scores (empathy, clarity, appropriateness, brand voice)
  - Completeness indicators (checkmarks for complete sections)
- Display reviewer notes and approval status
- Provide action buttons:
  - "Mark as Reviewed"
  - "Approve for Training"
  - "Flag for Review"
  - "Regenerate" (if quality is insufficient)
  - "Export as JSON"
- Support keyboard navigation (arrow keys for prev/next conversation)

### US-TRAIN-007: Migrate Seed Conversations from JSON

**As a** system administrator
**I want to** import existing seed conversations (1-10) from JSON files to database
**So that** the complete dataset is in the database for unified management

**Acceptance Criteria:**
- Provide "Import Seed Data" admin function
- Read JSON files from specified directory:
  - `c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json` (conversations 1-9)
  - `c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json` (conversation 10)
- Parse JSON structure and map to database schema:
  - Extract conversation metadata → `training_conversations` table
  - Extract each turn → `training_turns` table
  - Extract emotional context → `emotional_context` table
  - Extract response strategies → `response_strategies` table
  - Extract sentence breakdowns → `response_breakdowns` table
- Set appropriate flags:
  - `is_seed_example = true`
  - `generation_status = 'approved'`
  - `use_for_variations = true` (for designated seed examples)
- Calculate and store quality metrics:
  - Parse existing quality scores from JSON
  - Calculate completeness metrics
  - Mark as `ready_for_training = true`
- Handle missing or optional fields gracefully
- Validate data integrity during import:
  - Verify all required fields present
  - Check referential integrity
  - Validate score ranges
- Display import progress:
  - "Importing conversation X of 10..."
  - "Processed Y turns..."
  - "Saved Z sentence breakdowns..."
- Show import summary:
  - Total conversations imported: 10
  - Total turns imported: 41
  - Total sentences analyzed: 350+
  - Any warnings or issues
- Prevent duplicate imports (check for existing conversation_ids)
- Provide rollback capability if import fails
- Log all import operations for audit trail

### US-TRAIN-008: Monitor Generation Quality

**As a** training data manager
**I want to** view quality metrics and validation status
**So that** I can ensure training data meets standards

**Acceptance Criteria:**
- Display quality dashboard with metrics:
  - Average quality score across all generated conversations
  - Quality score distribution (histogram)
  - Conversations by status (pie chart)
  - Quality trend over time (line chart)
- Show validation status summary:
  - Conversations with complete annotation: X/Y
  - Conversations ready for training: X/Y
  - Conversations needing review: X conversations
  - Failed quality checks: X conversations
- Provide quality filters:
  - Filter by quality score range
  - Show only conversations needing review
  - Show only incomplete annotations
- Display detailed quality metrics per conversation:
  - Overall quality score (1-5)
  - Dimension scores (empathy, clarity, appropriateness, brand voice)
  - Completeness indicators:
    - ✓ Complete emotional context
    - ✓ Emotional progression tracked
    - ✓ Primary strategy with rationale
    - ✓ All sentences analyzed
    - ✓ Word choice rationales (3-6 per sentence)
- Highlight quality issues with actionable guidance:
  - "Missing emotional indicators" → Action: Review turn X
  - "Incomplete sentence analysis" → Action: Analyze sentences
  - "Low brand voice score (3.5/5.0)" → Action: Review Elena consistency
- Provide bulk quality actions:
  - "Mark all 5.0 conversations as approved"
  - "Flag all <4.0 conversations for review"
  - "Export quality report (CSV)"
- Support quality comparison:
  - Compare generated conversations to seed examples
  - Highlight significant quality deviations
  - Show which templates produce highest quality

---

## Technical Requirements

### TR-TRAIN-001: Frontend Architecture

**Framework Stack:**
- **Next.js 14** with App Router for server and client components
- **TypeScript** for type-safe development
- **React 18+** with hooks and modern patterns
- **Tailwind CSS** for utility-first styling
- **Shadcn/UI** component library for consistent design
- **Zustand** for client-side state management
- **React Query (TanStack Query)** for server state and caching
- **Sonner** for toast notifications
- **Lucide React** for icons

**Component Architecture:**
- Server Components for data fetching and initial rendering
- Client Components for interactive UI (tables, filters, dialogs)
- Shared components in `src/components/train-data/`
- Feature-based organization:
  - `conversation-matrix/` - Table and filtering components
  - `conversation-detail/` - Detail view and analysis components
  - `generation-controls/` - Generation buttons and progress
  - `quality-dashboard/` - Metrics and validation components

### TR-TRAIN-002: Backend Services

**Supabase Integration:**
- **Database:** PostgreSQL with the 8 tables defined in schema
- **Real-time Subscriptions:** For live generation progress updates
- **Row Level Security:** Enforce data access policies
- **Edge Functions:** For complex generation orchestration
- **Storage:** For JSON exports and logs

**API Routes (Next.js API):**
- `POST /api/train-data/generate/single` - Generate one conversation
- `POST /api/train-data/generate/batch` - Generate multiple conversations
- `POST /api/train-data/generate/process-all` - Generate all remaining
- `GET /api/train-data/conversations` - Fetch conversations with filters
- `GET /api/train-data/conversations/[id]` - Fetch conversation details
- `POST /api/train-data/import/seed` - Import seed JSON data
- `GET /api/train-data/quality/metrics` - Fetch quality dashboard data
- `PATCH /api/train-data/conversations/[id]/status` - Update status
- `POST /api/train-data/conversations/[id]/approve` - Approve conversation

**Claude API Integration:**
- **Anthropic SDK** for Claude 4.5 Sonnet API calls
- **Prompt Engineering:** Template-based prompts with variable substitution
- **Rate Limiting:** Respect Claude API limits (prevent 429 errors)
- **Error Handling:** Retry logic with exponential backoff
- **Token Tracking:** Monitor usage and costs
- **Response Parsing:** Robust JSON parsing with validation

### TR-TRAIN-003: Data Management

**Database Operations:**
- **Supabase Client:** Server-side client for database operations
- **Query Optimization:** Use indexes for fast filtering
- **Transaction Management:** Atomic operations for multi-table inserts
- **Cascade Deletes:** Proper foreign key relationships
- **JSONB Queries:** Efficient querying of JSONB fields
- **Full-Text Search:** For topic and content search

**State Management:**
- **Server State (React Query):**
  - Cache conversation list data
  - Optimistic updates for status changes
  - Real-time updates via Supabase subscriptions
  - Prefetching for performance
- **Client State (Zustand):**
  - Filter selections
  - UI state (selected rows, open modals)
  - Generation progress tracking
  - User preferences

**Data Validation:**
- **Zod Schemas:** Type-safe validation for API requests/responses
- **Database Constraints:** Enforce data integrity at DB level
- **Quality Checks:** Validate generated conversations meet standards
- **Completeness Validation:** Ensure all required fields populated

### TR-TRAIN-004: User Interface Design

**Conversation Matrix Table:**
- **React Table (TanStack Table):** For advanced table features
- **Features:**
  - Sortable columns
  - Multi-select rows with checkboxes
  - Row expansion for quick details
  - Column visibility controls
  - Sticky header on scroll
  - Responsive design (mobile-friendly)
  - Loading skeletons
  - Empty states
- **Pagination:** Server-side pagination with page size options
- **Filters:** Multi-select dropdowns and search inputs

**Generation Progress UI:**
- **Real-time Updates:** Via Supabase real-time subscriptions
- **Progress Indicators:**
  - Linear progress bars
  - Circular spinners
  - Step indicators
  - Estimated time remaining
- **Live Logs:** Streaming generation logs in expandable panel
- **Status Badges:** Color-coded status indicators
- **Toast Notifications:** For key events and errors

**Conversation Detail Panel:**
- **Modal or Slide-over:** Full-screen detail view
- **Tabbed Interface:** Organize different analysis views
- **Accordion Turns:** Expandable turns with full details
- **Syntax Highlighting:** For code-like content
- **Copy to Clipboard:** For easy data access
- **Export Options:** Download as JSON, PDF, or CSV

**Quality Dashboard:**
- **Charts (Recharts):** For visualizing quality metrics
- **Metric Cards:** Summary statistics
- **Trend Visualizations:** Quality over time
- **Distribution Charts:** Score distributions

### TR-TRAIN-005: Performance Requirements

**Loading Performance:**
- **Initial Load:** <2 seconds for conversation matrix
- **Filter Application:** <500ms to apply filters
- **Detail View:** <1 second to load conversation details
- **Real-time Updates:** <200ms latency for status changes

**Generation Performance:**
- **Single Conversation:** 2-5 minutes average
- **Batch Processing:** Sequential with 30-60 second buffer between calls
- **API Rate Limits:** Respect Claude API limits (prevent throttling)
- **Error Recovery:** Automatic retries with exponential backoff

**Data Caching:**
- **React Query Cache:** 5-minute stale time for conversation list
- **Supabase Real-time:** Instant updates for status changes
- **Optimistic Updates:** Immediate UI feedback for user actions

---

## Implementation Prompts for Claude-4.5-Sonnet

The following prompts are designed to be executed sequentially in Claude-4.5-sonnet in Cursor. Each prompt is modular and self-contained.

### PROMPT 1: Database Setup and Seed Data Migration

=========================



```
You are implementing the Training Data Generation Module for a LoRA fine-tuning training dataset platform. This is PROMPT 1 of 4 for building the complete system.

## Context

You are working in an existing Next.js 14 + TypeScript + Supabase codebase located at:
`C:\Users\james\Master\BrightHub\brun\train-data\src`

The codebase already has:
- Next.js 14 with App Router
- TypeScript configuration
- Supabase integration
- Shadcn/UI components
- Document categorization workflow (separate module)

## Task Overview

In this prompt, you will:
1. Execute the SQL migration script to create all 8 database tables
2. Create a data migration script to import 10 seed conversations from JSON files to database
3. Verify the migration was successful

## Required Files to Read

Before starting, read these files to understand the existing structure and the seed data:

1. **Database Schema Specification:**
   - Location: `C:\Users\james\Master\BrightHub\brun\train-data\pmc\product\03-bmo-functional-requirements-train-data-module.md`
   - Section: "SQL Migration Script"
   - This contains the complete SQL to create all tables

2. **Seed Conversation JSON Files:**
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json` (conversations 1-9, 38 turns)
   - `C:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json` (conversation 10, 3 turns)

3. **Existing Supabase Configuration:**
   - Check `src/lib/supabase.ts` for client configuration
   - Check `src/lib/database.ts` for existing service patterns (if exists)

## Detailed Implementation Steps

### Step 1: Execute SQL Migration

1. **Locate or create Supabase migration directory:**
   - Check if `supabase/migrations/` exists in the project
   - If not, create the directory structure

2. **Create migration file:**
   - File name: `YYYYMMDDHHMMSS_create_training_data_tables.sql`
   - Copy the complete SQL migration script from the functional requirements document
   - Place in `supabase/migrations/` directory

3. **Execute migration:**
   - If using Supabase CLI: `supabase db push`
   - If using Supabase dashboard: Copy SQL and execute in SQL Editor
   - Verify all 8 tables are created successfully

4. **Verify table creation:**
   - Run the verification query at the end of the migration script
   - Confirm all 8 tables exist with correct column counts

### Step 2: Create Seed Data Migration Script

Create a TypeScript migration script that:

1. **Reads the JSON seed files:**
   - Parse both JSON files
   - Validate JSON structure

2. **Maps JSON to database schema:**
   - Extract `training_conversations` data from `dataset_metadata` and conversation-level data
   - Extract `training_turns` data from `training_pairs` array
   - Extract `emotional_context` from each turn's `emotional_context` object
   - Extract `response_strategies` from each turn's `response_strategy` object
   - Extract `response_breakdowns` from each turn's `response_breakdown.sentences` array
   - Calculate `quality_metrics` from turn-level quality data

3. **Insert data with proper relationships:**
   - Use transactions for data integrity
   - Insert `training_conversations` first (get returned IDs)
   - Insert `training_turns` with conversation foreign keys (get returned IDs)
   - Insert `emotional_context` with turn foreign keys
   - Insert `response_strategies` with turn foreign keys
   - Insert `response_breakdowns` with turn foreign keys
   - Insert `quality_metrics` with conversation foreign keys

4. **Set appropriate flags:**
   - `is_seed_example = true` for all imported conversations
   - `generation_status = 'approved'`
   - `human_reviewed = true`
   - `use_for_variations = true` for conversations marked in JSON

5. **Handle data transformation:**
   - Parse JSONB fields correctly
   - Convert confidence scores to DECIMAL(3,2)
   - Map conversation_id strings correctly
   - Handle null/optional fields gracefully

**File to create:** `src/scripts/migrate-seed-conversations.ts`

**Script structure:**
```typescript
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const SEED_FILES = [
  'pmc/context-ai/pmct/training-data-seeds/c-alpha-build_v3.4-LoRA-FP-convo-10-first_v1.json',
  'pmc/context-ai/pmct/training-data-seeds/c-alpha-build_v3.4-LoRA-FP-convo-10-complete.json'
];

// Main migration function
async function migrateSeedConversations() {
  // Read environment variables
  // Create Supabase client
  // Read JSON files
  // Parse and transform data
  // Insert into database with transactions
  // Log progress
  // Return summary
}

// Execute migration
migrateSeedConversations()
  .then(summary => {
    console.log('Migration completed successfully:', summary);
    process.exit(0);
  })
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

### Step 3: Create Database Service Layer

Create a service layer for training data operations:

**File to create:** `src/lib/services/training-data-service.ts`

**Service structure:**
```typescript
import { createClient } from '@supabase/supabase-js';

// Types (import from database types or define)
type TrainingConversation = { /* ... */ };
type TrainingTurn = { /* ... */ };
// ... other types

export class TrainingDataService {
  private supabase;

  constructor() {
    this.supabase = createClient(/* ... */);
  }

  // Conversation CRUD
  async getConversations(filters?: ConversationFilters): Promise<TrainingConversation[]> { /* ... */ }
  async getConversationById(id: string): Promise<TrainingConversation | null> { /* ... */ }
  async createConversation(data: Partial<TrainingConversation>): Promise<TrainingConversation> { /* ... */ }
  async updateConversationStatus(id: string, status: string): Promise<void> { /* ... */ }

  // Turn operations
  async getTurnsByConversationId(conversationId: string): Promise<TrainingTurn[]> { /* ... */ }
  async createTurn(data: Partial<TrainingTurn>): Promise<TrainingTurn> { /* ... */ }

  // Quality operations
  async getQualityMetrics(conversationId: string): Promise<QualityMetrics | null> { /* ... */ }
  async calculateQualityMetrics(conversationId: string): Promise<QualityMetrics> { /* ... */ }

  // Filtering and querying
  async getConversationsByTier(tier: string): Promise<TrainingConversation[]> { /* ... */ }
  async getConversationsByPersona(persona: string): Promise<TrainingConversation[]> { /* ... */ }
  async getConversationsByStatus(status: string): Promise<TrainingConversation[]> { /* ... */ }

  // Generation job operations
  async createGenerationJob(jobType: string, conversationIds: string[]): Promise<GenerationJob> { /* ... */ }
  async updateGenerationJob(jobId: string, updates: Partial<GenerationJob>): Promise<void> { /* ... */ }
  async getGenerationJob(jobId: string): Promise<GenerationJob | null> { /* ... */ }
}

export const trainingDataService = new TrainingDataService();
```

### Step 4: Verification and Testing

Create a verification script to confirm successful migration:

**File to create:** `src/scripts/verify-seed-migration.ts`

**Verification checks:**
```typescript
async function verifySeedMigration() {
  console.log('Verifying seed data migration...\n');

  // Check 1: Verify conversation count
  const { count: conversationCount } = await supabase
    .from('training_conversations')
    .select('*', { count: 'exact', head: true })
    .eq('is_seed_example', true);

  console.log(`✓ Seed conversations: ${conversationCount} (expected: 10)`);

  // Check 2: Verify turn count
  const { count: turnCount } = await supabase
    .from('training_turns')
    .select('*', { count: 'exact', head: true });

  console.log(`✓ Total turns: ${turnCount} (expected: 41)`);

  // Check 3: Verify emotional context records
  const { count: emotionalContextCount } = await supabase
    .from('emotional_context')
    .select('*', { count: 'exact', head: true });

  console.log(`✓ Emotional context records: ${emotionalContextCount} (expected: 41)`);

  // Check 4: Verify response strategies
  const { count: strategyCount } = await supabase
    .from('response_strategies')
    .select('*', { count: 'exact', head: true });

  console.log(`✓ Response strategies: ${strategyCount} (expected: 41)`);

  // Check 5: Verify sentence breakdowns
  const { count: sentenceCount } = await supabase
    .from('response_breakdowns')
    .select('*', { count: 'exact', head: true });

  console.log(`✓ Sentence breakdowns: ${sentenceCount} (expected: 350+)`);

  // Check 6: Verify quality metrics
  const { count: qualityCount } = await supabase
    .from('quality_metrics')
    .select('*', { count: 'exact', head: true });

  console.log(`✓ Quality metrics: ${qualityCount} (expected: 10)`);

  // Check 7: Verify data integrity (foreign keys)
  const { data: orphanedTurns } = await supabase
    .from('training_turns')
    .select('id')
    .is('conversation_id', null);

  console.log(`✓ Orphaned turns: ${orphanedTurns?.length || 0} (expected: 0)`);

  // Check 8: Sample data verification
  const { data: sampleConversation } = await supabase
    .from('training_conversations')
    .select('*, training_turns(*), quality_metrics(*)')
    .eq('conversation_id', 'fp_david_002')
    .single();

  console.log(`✓ Sample conversation structure: ${sampleConversation ? 'Valid' : 'Invalid'}`);

  console.log('\nMigration verification complete!');
}
```

## Deliverables

By the end of this prompt, you should have:

1. ✅ All 8 database tables created in Supabase
2. ✅ SQL migration script in `supabase/migrations/`
3. ✅ Seed data migration script in `src/scripts/migrate-seed-conversations.ts`
4. ✅ Database service layer in `src/lib/services/training-data-service.ts`
5. ✅ Verification script in `src/scripts/verify-seed-migration.ts`
6. ✅ 10 seed conversations imported to database (conversations 1-10, 41 turns)
7. ✅ All relationships properly established (foreign keys working)
8. ✅ Verification report showing successful import

## Success Criteria

- All database tables created without errors
- All 10 seed conversations imported successfully
- All 41 turns with complete emotional context, strategies, and breakdowns
- All foreign key relationships intact
- Verification script passes all checks
- Data can be queried via trainingDataService

## Error Handling

If you encounter errors:
1. Check Supabase connection and credentials
2. Verify JSON file paths are correct
3. Check for data type mismatches
4. Verify JSONB fields are properly formatted
5. Use transactions to ensure atomic operations
6. Log detailed error messages for debugging

## Next Steps

After completing this prompt, PROMPT 2 will implement:
- Conversation matrix UI
- Filtering system
- Conversation detail view
```



+++++++++++++++

---

### PROMPT 2: Conversation Matrix UI and Filtering System

=========================



```
You are implementing the Training Data Generation Module for a LoRA fine-tuning training dataset platform. This is PROMPT 2 of 4 for building the complete system.

## Context

You have completed PROMPT 1 and now have:
- ✅ All 8 database tables created in Supabase
- ✅ 10 seed conversations imported to database
- ✅ Database service layer (`trainingDataService`)

## Task Overview

In this prompt, you will build:
1. Conversation Matrix UI (table view with all 100 conversations)
2. Multi-dimensional filtering system
3. Conversation detail view
4. Quality dashboard

## Required Files to Read

Before starting, review:
1. **Functional Requirements:** Section "User Stories & Acceptance Criteria" (US-TRAIN-001 through US-TRAIN-006)
2. **Technical Requirements:** Section "TR-TRAIN-004: User Interface Design"
3. **Existing UI Components:** Check `src/components/ui/` for available Shadcn/UI components
4. **Existing Workflow Components:** Check `src/components/workflow/` for patterns to follow

## Implementation Steps

### Step 1: Create Conversation Matrix Page

Create the main training data management page:

**File:** `src/app/(dashboard)/training-data/page.tsx`

```typescript
import { Suspense } from 'react';
import { ConversationMatrix } from '@/components/training-data/conversation-matrix';
import { ConversationFilters } from '@/components/training-data/conversation-filters';
import { QualityDashboard } from '@/components/training-data/quality-dashboard';
import { GenerationControls } from '@/components/training-data/generation-controls';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function TrainingDataPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Training Data Generation</h1>
          <p className="text-muted-foreground">
            Manage and generate 100 LoRA training conversations
          </p>
        </div>
        <GenerationControls />
      </div>

      <Tabs defaultValue="matrix" className="w-full">
        <TabsList>
          <TabsTrigger value="matrix">Conversation Matrix</TabsTrigger>
          <TabsTrigger value="quality">Quality Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          <ConversationFilters />
          <Suspense fallback={<div>Loading conversations...</div>}>
            <ConversationMatrix />
          </Suspense>
        </TabsContent>

        <TabsContent value="quality">
          <Suspense fallback={<div>Loading quality metrics...</div>}>
            <QualityDashboard />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Step 2: Create Conversation Matrix Component

Build the main table component with sortable columns and row selection:

**File:** `src/components/training-data/conversation-matrix/ConversationMatrix.tsx`

Use **@tanstack/react-table** for advanced table features:

```typescript
'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import type { TrainingConversation } from '@/types/training-data';

// Define columns
const columns: ColumnDef<TrainingConversation>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'conversation_number',
    header: '#',
    cell: ({ row }) => <div className="font-medium">#{row.original.conversation_number}</div>,
  },
  {
    accessorKey: 'conversation_id',
    header: 'ID',
  },
  {
    accessorKey: 'persona_type',
    header: 'Persona',
    cell: ({ row }) => <Badge variant="outline">{row.original.persona_type}</Badge>,
  },
  {
    accessorKey: 'topic_category',
    header: 'Topic',
    cell: ({ row }) => <div className="max-w-[300px] truncate">{row.original.topic_category}</div>,
  },
  {
    accessorKey: 'tier',
    header: 'Tier',
    cell: ({ row }) => {
      const tierMap = {
        tier1_template: 'T1: Template',
        tier2_scenario: 'T2: Scenario',
        tier3_edge: 'T3: Edge',
      };
      return <Badge>{tierMap[row.original.tier as keyof typeof tierMap]}</Badge>;
    },
  },
  {
    id: 'emotional_arc',
    header: 'Emotional Arc',
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.starting_emotion} → {row.original.ending_emotion}
      </div>
    ),
  },
  {
    accessorKey: 'turn_count',
    header: 'Turns',
  },
  {
    accessorKey: 'generation_status',
    header: 'Status',
    cell: ({ row }) => {
      const statusColors = {
        planned: 'secondary',
        in_progress: 'default',
        generated: 'success',
        reviewed: 'info',
        approved: 'success',
      };
      return (
        <Badge variant={statusColors[row.original.generation_status as keyof typeof statusColors] as any}>
          {row.original.generation_status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'quality_score',
    header: 'Quality',
    cell: ({ row }) => {
      if (!row.original.quality_score) return <span className="text-muted-foreground">—</span>;
      return (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{row.original.quality_score.toFixed(1)}</span>
        </div>
      );
    },
  },
];

export function ConversationMatrix() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { data: conversations, isLoading } = useConversations();

  const table = useReactTable({
    data: conversations || [],
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {/* Selection controls */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {Object.keys(rowSelection).length} selected
          </span>
          <Button size="sm" variant="default">
            Generate Selected
          </Button>
          <Button size="sm" variant="outline" onClick={() => setRowSelection({})}>
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageSize * table.getState().pagination.pageIndex + 1} to{' '}
          {Math.min(
            table.getState().pagination.pageSize * (table.getState().pagination.pageIndex + 1),
            conversations?.length || 0
          )}{' '}
          of {conversations?.length || 0} conversations
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Step 3: Create Filtering Component

Build the multi-dimensional filtering UI:

**File:** `src/components/training-data/conversation-filters/ConversationFilters.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { useFilterStore } from '@/stores/filter-store';

export function ConversationFilters() {
  const { filters, setFilter, clearFilters, activeFilterCount } = useFilterStore();

  const personaOptions = [
    { label: 'Marcus', value: 'Marcus' },
    { label: 'Jennifer', value: 'Jennifer' },
    { label: 'David', value: 'David' },
  ];

  const tierOptions = [
    { label: 'Tier 1: Template', value: 'tier1_template' },
    { label: 'Tier 2: Scenario', value: 'tier2_scenario' },
    { label: 'Tier 3: Edge', value: 'tier3_edge' },
  ];

  const statusOptions = [
    { label: 'Planned', value: 'planned' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Generated', value: 'generated' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Approved', value: 'approved' },
  ];

  const startingEmotionOptions = [
    { label: 'Confusion', value: 'Confusion' },
    { label: 'Shame', value: 'Shame' },
    { label: 'Anxiety', value: 'Anxiety' },
    { label: 'Frustration', value: 'Frustration' },
    { label: 'Guilt', value: 'Guilt' },
    { label: 'Fear', value: 'Fear' },
    { label: 'Skepticism', value: 'Skepticism' },
    { label: 'Excitement', value: 'Excitement' },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount} active</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>Persona</Label>
          <MultiSelect
            options={personaOptions}
            selected={filters.persona || []}
            onChange={(values) => setFilter('persona', values)}
            placeholder="Select personas..."
          />
        </div>

        <div className="space-y-2">
          <Label>Tier</Label>
          <MultiSelect
            options={tierOptions}
            selected={filters.tier || []}
            onChange={(values) => setFilter('tier', values)}
            placeholder="Select tiers..."
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <MultiSelect
            options={statusOptions}
            selected={filters.status || []}
            onChange={(values) => setFilter('status', values)}
            placeholder="Select statuses..."
          />
        </div>

        <div className="space-y-2">
          <Label>Starting Emotion</Label>
          <MultiSelect
            options={startingEmotionOptions}
            selected={filters.startingEmotion || []}
            onChange={(values) => setFilter('startingEmotion', values)}
            placeholder="Select emotions..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Topic Search</Label>
          <Input
            placeholder="Search by topic or keyword..."
            value={filters.topicSearch || ''}
            onChange={(e) => setFilter('topicSearch', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Min Quality Score</Label>
          <Input
            type="number"
            min="1"
            max="5"
            step="0.1"
            placeholder="e.g., 4.5"
            value={filters.minQuality || ''}
            onChange={(e) => setFilter('minQuality', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
}
```

### Step 4: Create React Query Hooks

Set up data fetching with React Query:

**File:** `src/hooks/useConversations.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainingDataService } from '@/lib/services/training-data-service';
import { useFilterStore } from '@/stores/filter-store';
import type { TrainingConversation } from '@/types/training-data';

export function useConversations() {
  const { filters } = useFilterStore();

  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => trainingDataService.getConversations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => trainingDataService.getConversationById(id),
    enabled: !!id,
  });
}

export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      trainingDataService.updateConversationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
```

### Step 5: Create Filter Store

Manage filter state with Zustand:

**File:** `src/stores/filter-store.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConversationFilters {
  persona?: string[];
  tier?: string[];
  status?: string[];
  startingEmotion?: string[];
  endingEmotion?: string[];
  topicSearch?: string;
  minQuality?: number;
}

interface FilterStore {
  filters: ConversationFilters;
  setFilter: (key: keyof ConversationFilters, value: any) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      filters: {},
      setFilter: (key, value) => {
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        }));
      },
      clearFilters: () => set({ filters: {} }),
      get activeFilterCount() {
        const filters = get().filters;
        return Object.values(filters).filter(
          (value) =>
            value !== undefined &&
            value !== '' &&
            (Array.isArray(value) ? value.length > 0 : true)
        ).length;
      },
    }),
    {
      name: 'conversation-filters',
    }
  )
);
```

### Step 6: Create Conversation Detail Modal

**File:** `src/components/training-data/conversation-detail/ConversationDetailModal.tsx`

```typescript
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { useConversation } from '@/hooks/useConversations';
import type { TrainingConversation } from '@/types/training-data';

interface Props {
  conversationId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ConversationDetailModal({ conversationId, open, onClose }: Props) {
  const { data: conversation, isLoading } = useConversation(conversationId || '');

  if (!conversationId || !conversation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            <span>{conversation.conversation_id}</span>
            <Badge>{conversation.persona_type}</Badge>
            {conversation.quality_score && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{conversation.quality_score.toFixed(1)}</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="turns">Turns</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Conversation Details</h4>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Number:</dt>
                    <dd>#{conversation.conversation_number}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Topic:</dt>
                    <dd>{conversation.topic_category}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Tier:</dt>
                    <dd>{conversation.tier}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Turns:</dt>
                    <dd>{conversation.turn_count}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Emotional Arc</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Starting</div>
                      <div className="font-semibold">{conversation.starting_emotion}</div>
                      <div className="text-xs">
                        Intensity: {conversation.starting_emotion_intensity?.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-2xl">→</div>
                    <div>
                      <div className="text-xs text-muted-foreground">Ending</div>
                      <div className="font-semibold">{conversation.ending_emotion}</div>
                      <div className="text-xs">
                        Intensity: {conversation.ending_emotion_intensity?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{conversation.topic_description}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Expected Outcome</h4>
              <p className="text-sm text-muted-foreground">{conversation.expected_outcome}</p>
            </div>
          </TabsContent>

          <TabsContent value="turns">
            {/* Turn details - to be implemented */}
            <div className="text-center text-muted-foreground py-8">
              Turn details will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="analysis">
            {/* Emotional analysis - to be implemented */}
            <div className="text-center text-muted-foreground py-8">
              Emotional analysis will be displayed here
            </div>
          </TabsContent>

          <TabsContent value="quality">
            {/* Quality metrics - to be implemented */}
            <div className="text-center text-muted-foreground py-8">
              Quality metrics will be displayed here
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

## Deliverables

By the end of this prompt, you should have:

1. ✅ Conversation matrix page with routing
2. ✅ Table component with sorting, pagination, row selection
3. ✅ Multi-dimensional filtering UI
4. ✅ React Query hooks for data fetching
5. ✅ Zustand store for filter state
6. ✅ Conversation detail modal (basic structure)
7. ✅ All components properly typed with TypeScript
8. ✅ Integration with existing codebase styling

## Success Criteria

- Conversation matrix displays all conversations from database
- Filters work correctly (persona, tier, status, emotion, topic)
- Row selection enables batch actions
- Sorting and pagination function properly
- Clicking a conversation opens detail modal
- Loading states display correctly
- Responsive design works on mobile and desktop

## Next Steps

After completing this prompt, PROMPT 3 will implement:
- Generation controls and API integration
- Single conversation generation
- Batch generation with progress tracking
- "Process All" functionality
```



+++++++++++++++

---
