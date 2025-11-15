/**
 * Database Schema Setup using Direct PostgreSQL Connection
 * Creates all scaffolding tables: personas, emotional_arcs, training_topics, prompt_templates
 */

// Load environment variables from .env.local
const path = require('path');
const dotenv = require('dotenv');
const { Client } = require('pg');

const envPath = path.join(__dirname, '../../.env.local');
console.log('Loading environment from:', envPath);
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  console.error('Error loading .env.local:', envResult.error);
  process.exit(1);
}
console.log('Environment loaded. DATABASE_URL present:', !!process.env.DATABASE_URL);

async function setupScaffoldingSchema() {
  console.log('🚀 Starting database schema setup...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=require') 
      ? { rejectUnauthorized: false }
      : undefined
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // ============================================================================
    // CREATE TABLES
    // ============================================================================

    const ddlStatements = [
      `-- PERSONAS TABLE
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
);`,

      `CREATE INDEX IF NOT EXISTS idx_personas_key ON personas(persona_key);`,
      `CREATE INDEX IF NOT EXISTS idx_personas_archetype ON personas(archetype);`,
      `CREATE INDEX IF NOT EXISTS idx_personas_active ON personas(is_active);`,

      `COMMENT ON TABLE personas IS 'Client persona definitions for conversation generation';`,
      `COMMENT ON COLUMN personas.persona_key IS 'Unique identifier like overwhelmed_avoider';`,

      `-- EMOTIONAL ARCS TABLE
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
);`,

      `CREATE INDEX IF NOT EXISTS idx_emotional_arcs_key ON emotional_arcs(arc_key);`,
      `CREATE INDEX IF NOT EXISTS idx_emotional_arcs_starting ON emotional_arcs(starting_emotion);`,
      `CREATE INDEX IF NOT EXISTS idx_emotional_arcs_ending ON emotional_arcs(ending_emotion);`,
      `CREATE INDEX IF NOT EXISTS idx_emotional_arcs_tier ON emotional_arcs(tier);`,
      `CREATE INDEX IF NOT EXISTS idx_emotional_arcs_active ON emotional_arcs(is_active);`,

      `COMMENT ON TABLE emotional_arcs IS 'Emotional transformation patterns';`,
      `COMMENT ON COLUMN emotional_arcs.arc_key IS 'Unique identifier like confusion_to_clarity';`,

      `-- TRAINING TOPICS TABLE
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
);`,

      `CREATE INDEX IF NOT EXISTS idx_training_topics_key ON training_topics(topic_key);`,
      `CREATE INDEX IF NOT EXISTS idx_training_topics_category ON training_topics(category);`,
      `CREATE INDEX IF NOT EXISTS idx_training_topics_complexity ON training_topics(complexity_level);`,
      `CREATE INDEX IF NOT EXISTS idx_training_topics_active ON training_topics(is_active);`,

      `COMMENT ON TABLE training_topics IS 'Financial planning conversation topics';`,
      `COMMENT ON COLUMN training_topics.topic_key IS 'Unique identifier like hsa_vs_fsa';`,

      `-- PROMPT TEMPLATES TABLE
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
);`,

      `CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc ON prompt_templates(emotional_arc_id);`,
      `CREATE INDEX IF NOT EXISTS idx_prompt_templates_arc_type ON prompt_templates(emotional_arc_type);`,
      `CREATE INDEX IF NOT EXISTS idx_prompt_templates_tier ON prompt_templates(tier);`,
      `CREATE INDEX IF NOT EXISTS idx_prompt_templates_active ON prompt_templates(is_active);`,

      `COMMENT ON TABLE prompt_templates IS 'Prompt templates for conversation generation';`,
      `COMMENT ON COLUMN prompt_templates.emotional_arc_type IS 'Primary selector for emotional arc';`
    ];

    console.log('📋 Dropping existing tables (if any)...\n');

    const dropStatements = [
      'DROP TABLE IF EXISTS prompt_templates CASCADE;',
      'DROP TABLE IF EXISTS emotional_arcs CASCADE;',
      'DROP TABLE IF EXISTS personas CASCADE;',
      'DROP TABLE IF EXISTS training_topics CASCADE;'
    ];

    for (const stmt of dropStatements) {
      try {
        await client.query(stmt);
        const tableName = stmt.match(/DROP TABLE IF EXISTS (\w+)/)[1];
        console.log(`🗑️  Dropped table: ${tableName}`);
      } catch (error) {
        console.error(`⚠️  Warning dropping table:`, error.message);
      }
    }

    console.log('\n📋 Creating tables and indexes...\n');

    for (let i = 0; i < ddlStatements.length; i++) {
      const stmt = ddlStatements[i];
      try {
        await client.query(stmt);
        if (stmt.includes('CREATE TABLE')) {
          const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
          console.log(`✅ Created table: ${tableName}`);
        } else if (stmt.includes('CREATE INDEX')) {
          const indexName = stmt.match(/CREATE INDEX IF NOT EXISTS (\w+)/)[1];
          console.log(`✅ Created index: ${indexName}`);
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }

    // ============================================================================
    // VERIFY TABLES
    // ============================================================================

    console.log('\n🔍 Verifying tables...\n');

    const tablesToVerify = ['personas', 'emotional_arcs', 'training_topics', 'prompt_templates'];

    for (const table of tablesToVerify) {
      const result = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = $1) as column_count,
          (SELECT COUNT(*) FROM pg_indexes WHERE tablename = $1) as index_count,
          (SELECT COUNT(*) FROM ${table}) as row_count
      `, [table]);

      const { column_count, index_count, row_count } = result.rows[0];
      console.log(`✅ ${table}:`);
      console.log(`   - Columns: ${column_count}`);
      console.log(`   - Indexes: ${index_count}`);
      console.log(`   - Rows: ${row_count}`);
    }

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

  } catch (error) {
    console.error('\n💥 Schema setup failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
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

