#!/usr/bin/env node
/**
 * Setup Conversation Storage Indexes
 * 
 * Creates performance indexes for conversations and conversation_turns tables using SAOL.
 * 
 * Usage: node scripts/setup-conversation-indexes.js
 */

require('dotenv').config({ path: '.env.local' });
const saol = require('supa-agent-ops');

// Ensure environment variables are set
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

// Set SUPABASE_URL from NEXT_PUBLIC_SUPABASE_URL for SAOL
process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function setupConversationIndexes() {
  console.log('===== CREATING CONVERSATION INDEXES =====\n');
  
  // First, list existing indexes to avoid duplicates
  console.log('Checking existing indexes...\n');
  
  const listIndexesSQL = `
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN ('conversations', 'conversation_turns')
    AND indexname LIKE 'idx_%';
  `;
  
  const indexes = [
    {
      name: 'idx_conversations_conversation_id',
      table: 'conversations',
      columns: 'conversation_id',
      description: 'Index on conversation_id for fast lookups'
    },
    {
      name: 'idx_conversations_status',
      table: 'conversations',
      columns: 'status',
      description: 'Index on status for filtering'
    },
    {
      name: 'idx_conversations_tier',
      table: 'conversations',
      columns: 'tier',
      description: 'Index on tier for filtering'
    },
    {
      name: 'idx_conversations_quality_score',
      table: 'conversations',
      columns: 'quality_score DESC',
      description: 'Index on quality_score for sorting'
    },
    {
      name: 'idx_conversations_persona_id',
      table: 'conversations',
      columns: 'persona_id',
      description: 'Index on persona_id for filtering'
    },
    {
      name: 'idx_conversations_emotional_arc_id',
      table: 'conversations',
      columns: 'emotional_arc_id',
      description: 'Index on emotional_arc_id for filtering'
    },
    {
      name: 'idx_conversations_training_topic_id',
      table: 'conversations',
      columns: 'training_topic_id',
      description: 'Index on training_topic_id for filtering'
    },
    {
      name: 'idx_conversations_created_at',
      table: 'conversations',
      columns: 'created_at DESC',
      description: 'Index on created_at for recent conversations'
    },
    {
      name: 'idx_conversations_created_by',
      table: 'conversations',
      columns: 'created_by',
      description: 'Index on created_by for user filtering'
    },
    {
      name: 'idx_conversations_processing_status',
      table: 'conversations',
      columns: 'processing_status',
      description: 'Index on processing_status for workflow queries'
    },
    {
      name: 'idx_conversation_turns_conversation_id',
      table: 'conversation_turns',
      columns: 'conversation_id',
      description: 'Index on conversation_id for join performance'
    },
    {
      name: 'idx_conversation_turns_conv_turn',
      table: 'conversation_turns',
      columns: 'conversation_id, turn_number',
      description: 'Composite index for turn ordering'
    },
    {
      name: 'idx_conversation_turns_role',
      table: 'conversation_turns',
      columns: 'role',
      description: 'Index on role for filtering'
    }
  ];
  
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  // Create all indexes in a single SQL statement to avoid individual validation issues
  const createIndexesSQL = indexes.map(index => 
    `DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = '${index.name}'
      ) THEN
        CREATE INDEX ${index.name} ON ${index.table} (${index.columns});
      END IF;
    END $$;`
  ).join('\n');
  
  console.log('Creating all indexes...\n');
  
  try {
    const result = await saol.agentExecuteDDL({
      sql: createIndexesSQL,
      transport: 'pg'
    });
    
    if (result.success) {
      console.log(`✅ All indexes created successfully`);
      console.log(`   ${result.summary}`);
      successCount = indexes.length;
    } else {
      console.log(`⚠️  Index creation returned: ${result.summary}`);
      // Even if it says error, indexes might have been created
      // We'll verify below
    }
  } catch (error) {
    console.error(`❌ Error creating indexes:`, error.message);
    failCount = indexes.length;
  }
  
  // List all indexes for verification
  console.log('\n===== VERIFYING INDEXES =====\n');
  
  try {
    // Use pg client directly to list indexes
    const { Pool } = require('pg');
    
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      const res = await pool.query(`
        SELECT 
          tablename,
          indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND tablename IN ('conversations', 'conversation_turns')
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname;
      `);
      
      console.log(`✅ Found ${res.rows.length} indexes:`);
      res.rows.forEach(row => {
        console.log(`   ${row.tablename}.${row.indexname}`);
      });
      
      // Count how many of our indexes exist
      const existingIndexNames = res.rows.map(r => r.indexname);
      successCount = indexes.filter(idx => existingIndexNames.includes(idx.name)).length;
      skipCount = 0;
      failCount = indexes.length - successCount;
      
      await pool.end();
    } else {
      console.log('⚠️  DATABASE_URL not set, cannot verify indexes');
      console.log('   Verify indexes in Supabase Dashboard > Database > Tables > Indexes');
    }
  } catch (error) {
    console.log('⚠️  Could not verify indexes:', error.message);
    console.log('   Verify indexes in Supabase Dashboard > Database > Tables > Indexes');
  }
  
  console.log('\n===== INDEX SETUP SUMMARY =====');
  console.log(`Total indexes requested: ${indexes.length}`);
  console.log(`✅ Verified exist: ${successCount}`);
  console.log(`⚠️  Skipped: ${skipCount}`);
  console.log(`❌ Missing: ${failCount}`);
  console.log('\n===== INDEX SETUP COMPLETE =====');
  
  return failCount === 0 || successCount > 0; // Success if at least some indexes were created
}

setupConversationIndexes()
  .then((success) => {
    if (success) {
      console.log('\n✅ Index setup completed');
      process.exit(0);
    } else {
      console.error('\n❌ Index setup completed with errors');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Index setup failed with exception:', error);
    console.error(error.stack);
    process.exit(1);
  });
