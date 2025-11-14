// Recreate personas table with correct schema
const saol = require('../../supa-agent-ops');

async function recreatePersonasTable() {
  console.log('🔄 Recreating personas table...\n');

  try {
    // Drop existing table
    console.log('📋 Dropping existing personas table...');
    const dropSQL = 'DROP TABLE IF EXISTS personas CASCADE;';
    const dropResult = await saol.agentExecuteSQL({ sql: dropSQL, transport: 'rpc' });
    
    if (!dropResult.success) {
      console.error('❌ Failed to drop table:', dropResult.summary);
      return false;
    }
    console.log('✅ Table dropped\n');

    // Create table with correct schema
    console.log('📋 Creating personas table with correct schema...');
    const createSQL = `
      CREATE TABLE personas (
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
    
    const createResult = await saol.agentExecuteSQL({ sql: createSQL, transport: 'rpc' });
    
    if (!createResult.success) {
      console.error('❌ Failed to create table:', createResult.summary);
      return false;
    }
    console.log('✅ Table created\n');

    // Create indexes
    console.log('📋 Creating indexes...');
    const indexesSQL = `
      CREATE INDEX idx_personas_persona_type ON personas(persona_type);
      CREATE INDEX idx_personas_domain ON personas(domain);
      CREATE INDEX idx_personas_is_active ON personas(is_active);
      CREATE INDEX idx_personas_emotional_baseline ON personas(emotional_baseline);
    `;
    
    const indexesResult = await saol.agentExecuteSQL({ sql: indexesSQL, transport: 'rpc' });
    
    if (!indexesResult.success) {
      console.error('❌ Failed to create indexes:', indexesResult.summary);
      return false;
    }
    console.log('✅ Indexes created\n');

    console.log('🎉 Personas table recreated successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  recreatePersonasTable()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { recreatePersonasTable };

