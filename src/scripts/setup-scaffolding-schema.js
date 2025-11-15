/**
 * Database Schema Setup using SAOL
 * Creates all scaffolding tables: personas, emotional_arcs, training_topics, prompt_templates
 */

// Load environment variables from .env.local
const path = require('path');
const dotenv = require('dotenv');
const envPath = path.join(__dirname, '../../.env.local');
console.log('Loading environment from:', envPath);
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('Error loading .env.local:', envResult.error);
  process.exit(1);
}
console.log('Environment loaded. DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('Environment loaded. SUPABASE_URL present:', !!process.env.SUPABASE_URL);

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Create base table with all columns upfront
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  emotional_arc_id UUID,
  emotional_arc_type VARCHAR(50),
  suitable_personas TEXT[],
  suitable_topics TEXT[],
  methodology_principles TEXT[]
);

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
    dryRunResult.nextActions?.forEach((action, i) => {
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
    executeResult.nextActions?.forEach((action, i) => {
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

    const tableInfo = schemaResult.tables?.find((t) => t.name === table);
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

