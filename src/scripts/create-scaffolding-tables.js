// Create scaffolding tables for conversation generation system
// This script creates: personas, emotional_arcs, training_topics tables
// and alters conversations and prompt_templates tables

const saol = require('../../supa-agent-ops');

async function createScaffoldingTables() {
  console.log('🚀 Starting scaffolding table creation...\n');

  try {
    // 1. Create personas table
    console.log('📋 Creating personas table...');
    const personasSQL = `
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
    `;

    const personasResult = await saol.agentExecuteSQL({ sql: personasSQL, transport: 'rpc' });
    if (personasResult.success) {
      console.log('✅ personas table created successfully\n');
    } else {
      console.error('❌ Failed to create personas table:', personasResult.summary);
      return;
    }

    // Create personas indexes
    console.log('📋 Creating personas indexes...');
    const personasIndexes = `
      CREATE INDEX IF NOT EXISTS idx_personas_persona_type ON personas(persona_type);
      CREATE INDEX IF NOT EXISTS idx_personas_domain ON personas(domain);
      CREATE INDEX IF NOT EXISTS idx_personas_is_active ON personas(is_active);
      CREATE INDEX IF NOT EXISTS idx_personas_emotional_baseline ON personas(emotional_baseline);
    `;
    
    const personasIndexResult = await saol.agentExecuteSQL({ sql: personasIndexes, transport: 'rpc' });
    if (personasIndexResult.success) {
      console.log('✅ personas indexes created successfully\n');
    }

    // 2. Create emotional_arcs table
    console.log('📋 Creating emotional_arcs table...');
    const emotionalArcsSQL = `
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
    `;

    const emotionalArcsResult = await saol.agentExecuteSQL({ sql: emotionalArcsSQL, transport: 'rpc' });
    if (emotionalArcsResult.success) {
      console.log('✅ emotional_arcs table created successfully\n');
    } else {
      console.error('❌ Failed to create emotional_arcs table:', emotionalArcsResult.summary);
      return;
    }

    // Create emotional_arcs indexes
    console.log('📋 Creating emotional_arcs indexes...');
    const emotionalArcsIndexes = `
      CREATE INDEX IF NOT EXISTS idx_emotional_arcs_arc_type ON emotional_arcs(arc_type);
      CREATE INDEX IF NOT EXISTS idx_emotional_arcs_domain ON emotional_arcs(domain);
      CREATE INDEX IF NOT EXISTS idx_emotional_arcs_is_active ON emotional_arcs(is_active);
      CREATE INDEX IF NOT EXISTS idx_emotional_arcs_starting_emotion ON emotional_arcs(starting_emotion);
    `;
    
    const emotionalArcsIndexResult = await saol.agentExecuteSQL({ sql: emotionalArcsIndexes, transport: 'rpc' });
    if (emotionalArcsIndexResult.success) {
      console.log('✅ emotional_arcs indexes created successfully\n');
    }

    // 3. Create training_topics table
    console.log('📋 Creating training_topics table...');
    const trainingTopicsSQL = `
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
    `;

    const trainingTopicsResult = await saol.agentExecuteSQL({ sql: trainingTopicsSQL, transport: 'rpc' });
    if (trainingTopicsResult.success) {
      console.log('✅ training_topics table created successfully\n');
    } else {
      console.error('❌ Failed to create training_topics table:', trainingTopicsResult.summary);
      return;
    }

    // Create training_topics indexes
    console.log('📋 Creating training_topics indexes...');
    const trainingTopicsIndexes = `
      CREATE INDEX IF NOT EXISTS idx_training_topics_topic_key ON training_topics(topic_key);
      CREATE INDEX IF NOT EXISTS idx_training_topics_domain ON training_topics(domain);
      CREATE INDEX IF NOT EXISTS idx_training_topics_category ON training_topics(category);
      CREATE INDEX IF NOT EXISTS idx_training_topics_complexity ON training_topics(complexity_level);
      CREATE INDEX IF NOT EXISTS idx_training_topics_is_active ON training_topics(is_active);
    `;
    
    const trainingTopicsIndexResult = await saol.agentExecuteSQL({ sql: trainingTopicsIndexes, transport: 'rpc' });
    if (trainingTopicsIndexResult.success) {
      console.log('✅ training_topics indexes created successfully\n');
    }

    // 4. Alter conversations table
    console.log('📋 Altering conversations table to add scaffolding columns...');
    const alterConversationsSQL = `
      ALTER TABLE conversations
        ADD COLUMN IF NOT EXISTS persona_id UUID REFERENCES personas(id),
        ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
        ADD COLUMN IF NOT EXISTS training_topic_id UUID REFERENCES training_topics(id),
        ADD COLUMN IF NOT EXISTS scaffolding_snapshot JSONB;
    `;

    const alterConversationsResult = await saol.agentExecuteSQL({ sql: alterConversationsSQL, transport: 'rpc' });
    if (alterConversationsResult.success) {
      console.log('✅ conversations table altered successfully\n');
    } else {
      console.error('❌ Failed to alter conversations table:', alterConversationsResult.summary);
      return;
    }

    // Create conversations scaffolding indexes
    console.log('📋 Creating conversations scaffolding indexes...');
    const conversationsScaffoldingIndexes = `
      CREATE INDEX IF NOT EXISTS idx_conversations_persona_id ON conversations(persona_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_emotional_arc_id ON conversations(emotional_arc_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_training_topic_id ON conversations(training_topic_id);
    `;
    
    const conversationsScaffoldingIndexResult = await saol.agentExecuteSQL({ sql: conversationsScaffoldingIndexes, transport: 'rpc' });
    if (conversationsScaffoldingIndexResult.success) {
      console.log('✅ conversations scaffolding indexes created successfully\n');
    }

    // 5. Alter prompt_templates table
    console.log('📋 Altering prompt_templates table to add emotional arc columns...');
    const alterPromptTemplatesSQL = `
      ALTER TABLE prompt_templates
        ADD COLUMN IF NOT EXISTS emotional_arc_id UUID REFERENCES emotional_arcs(id),
        ADD COLUMN IF NOT EXISTS emotional_arc_type VARCHAR(50),
        ADD COLUMN IF NOT EXISTS suitable_personas TEXT[],
        ADD COLUMN IF NOT EXISTS suitable_topics TEXT[],
        ADD COLUMN IF NOT EXISTS methodology_principles TEXT[];
    `;

    const alterPromptTemplatesResult = await saol.agentExecuteSQL({ sql: alterPromptTemplatesSQL, transport: 'rpc' });
    if (alterPromptTemplatesResult.success) {
      console.log('✅ prompt_templates table altered successfully\n');
    } else {
      console.error('❌ Failed to alter prompt_templates table:', alterPromptTemplatesResult.summary);
      return;
    }

    // Create prompt_templates emotional arc indexes
    console.log('📋 Creating prompt_templates emotional arc indexes...');
    const promptTemplatesEmotionalArcIndexes = `
      CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc_id ON prompt_templates(emotional_arc_id);
      CREATE INDEX IF NOT EXISTS idx_prompt_templates_emotional_arc_type ON prompt_templates(emotional_arc_type);
    `;
    
    const promptTemplatesEmotionalArcIndexResult = await saol.agentExecuteSQL({ sql: promptTemplatesEmotionalArcIndexes, transport: 'rpc' });
    if (promptTemplatesEmotionalArcIndexResult.success) {
      console.log('✅ prompt_templates emotional arc indexes created successfully\n');
    }

    console.log('🎉 All scaffolding tables and columns created successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ personas table created with indexes');
    console.log('   ✅ emotional_arcs table created with indexes');
    console.log('   ✅ training_topics table created with indexes');
    console.log('   ✅ conversations table altered with foreign keys and indexes');
    console.log('   ✅ prompt_templates table altered with foreign keys and indexes');

  } catch (error) {
    console.error('❌ Error during table creation:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  createScaffoldingTables()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { createScaffoldingTables };

