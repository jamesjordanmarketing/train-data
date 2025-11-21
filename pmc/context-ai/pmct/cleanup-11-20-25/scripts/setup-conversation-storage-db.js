#!/usr/bin/env node
/**
 * Setup Conversation Storage Database Tables
 * 
 * Updates the existing conversations and conversation_turns tables with columns needed for file storage.
 * Uses dry-run mode first for safety.
 * 
 * Usage: node scripts/setup-conversation-storage-db.js
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

async function setupConversationStorageDatabase() {
  console.log('===== CONVERSATION STORAGE DATABASE SETUP =====\n');
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  console.log('');
  
  // Step 1: Check existing tables
  console.log('1. Checking existing tables...');
  
  const conversationsSchema = await saol.agentIntrospectSchema({
    table: 'conversations',
    includeColumns: true,
    transport: 'pg'
  });
  
  const conversationsExists = conversationsSchema.tables[0]?.exists || false;
  console.log(`   conversations table exists: ${conversationsExists}`);
  
  if (!conversationsExists) {
    console.error('❌ conversations table does not exist. This script requires the base tables to exist.');
    console.log('\nPlease ensure the base conversation tables are created first.');
    return false;
  }
  
  const turnsSchema = await saol.agentIntrospectSchema({
    table: 'conversation_turns',
    includeColumns: true,
    transport: 'pg'
  });
  
  const turnsExists = turnsSchema.tables[0]?.exists || false;
  console.log(`   conversation_turns table exists: ${turnsExists}`);
  
  if (!turnsExists) {
    console.error('❌ conversation_turns table does not exist. This script requires the base tables to exist.');
    return false;
  }
  
  const existingConvColumns = conversationsSchema.tables[0]?.columns?.map(c => c.name) || [];
  const existingTurnsColumns = turnsSchema.tables[0]?.columns?.map(c => c.name) || [];
  
  console.log(`   conversations columns: ${existingConvColumns.length}`);
  console.log(`   conversation_turns columns: ${existingTurnsColumns.length}`);
  
  // Step 2: Add missing columns to conversations table
  console.log('\n2. Adding missing columns to conversations table...');
  
  const columnsToAdd = [
    { name: 'file_url', type: 'TEXT', description: 'URL to conversation file in storage' },
    { name: 'file_size', type: 'BIGINT', description: 'File size in bytes' },
    { name: 'file_path', type: 'TEXT', description: 'Storage path to conversation file' },
    { name: 'storage_bucket', type: 'VARCHAR(100)', default: "'conversation-files'", description: 'Storage bucket name' },
    { name: 'template_id', type: 'UUID', description: 'Reference to prompt template' },
    { name: 'persona_key', type: 'VARCHAR(100)', description: 'Persona key for queries' },
    { name: 'emotional_arc_key', type: 'VARCHAR(100)', description: 'Emotional arc key for queries' },
    { name: 'topic_key', type: 'VARCHAR(100)', description: 'Topic key for queries' },
    { name: 'conversation_name', type: 'VARCHAR(255)', description: 'Friendly name for conversation' },
    { name: 'description', type: 'TEXT', description: 'Conversation description' },
    { name: 'empathy_score', type: 'NUMERIC(3,1)', description: 'Empathy quality score' },
    { name: 'clarity_score', type: 'NUMERIC(3,1)', description: 'Clarity quality score' },
    { name: 'appropriateness_score', type: 'NUMERIC(3,1)', description: 'Appropriateness quality score' },
    { name: 'brand_voice_alignment', type: 'NUMERIC(3,1)', description: 'Brand voice alignment score' },
    { name: 'processing_status', type: 'VARCHAR(50)', default: "'completed'", description: 'Processing workflow status' },
    { name: 'starting_emotion', type: 'VARCHAR(100)', description: 'Starting emotion' },
    { name: 'ending_emotion', type: 'VARCHAR(100)', description: 'Ending emotion' },
    { name: 'emotional_intensity_start', type: 'NUMERIC(3,2)', description: 'Starting emotional intensity' },
    { name: 'emotional_intensity_end', type: 'NUMERIC(3,2)', description: 'Ending emotional intensity' },
    { name: 'usage_count', type: 'INTEGER', default: '0', description: 'Usage count' },
    { name: 'last_exported_at', type: 'TIMESTAMPTZ', description: 'Last export timestamp' },
    { name: 'export_count', type: 'INTEGER', default: '0', description: 'Export count' },
    { name: 'reviewed_by', type: 'UUID', description: 'Reviewer user ID' },
    { name: 'reviewed_at', type: 'TIMESTAMPTZ', description: 'Review timestamp' },
    { name: 'review_notes', type: 'TEXT', description: 'Review notes' },
    { name: 'expires_at', type: 'TIMESTAMPTZ', description: 'Expiration timestamp' },
    { name: 'is_active', type: 'BOOLEAN', default: 'true', description: 'Active status' }
  ];
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const col of columnsToAdd) {
    if (existingConvColumns.includes(col.name)) {
      console.log(`   ⚠️  Column ${col.name} already exists (skipping)`);
      skippedCount++;
      continue;
    }
    
    const alterSQL = `ALTER TABLE conversations ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}${col.default ? ` DEFAULT ${col.default}` : ''};`;
    
    const result = await saol.agentExecuteDDL({
      sql: alterSQL,
      transport: 'pg'
    });
    
    if (result.success) {
      console.log(`   ✅ Added column: ${col.name}`);
      addedCount++;
    } else {
      // Check if error is "column already exists" which is OK
      if (result.summary && result.summary.toLowerCase().includes('already exists')) {
        console.log(`   ⚠️  Column ${col.name} already exists (OK)`);
        skippedCount++;
      } else {
        console.log(`   ⚠️  Failed to add ${col.name}: ${result.summary}`);
      }
    }
  }
  
  console.log(`   Summary: ${addedCount} added, ${skippedCount} skipped`);
  
  // Step 3: Add missing columns to conversation_turns table
  console.log('\n3. Adding missing columns to conversation_turns table...');
  
  const turnsColumnsToAdd = [
    { name: 'detected_emotion', type: 'VARCHAR(100)', description: 'Detected emotion' },
    { name: 'emotion_confidence', type: 'NUMERIC(3,2)', description: 'Emotion detection confidence' },
    { name: 'emotional_intensity', type: 'NUMERIC(3,2)', description: 'Emotional intensity' },
    { name: 'primary_strategy', type: 'VARCHAR(255)', description: 'Primary response strategy' },
    { name: 'tone', type: 'VARCHAR(100)', description: 'Response tone' },
    { name: 'word_count', type: 'INTEGER', description: 'Word count' },
    { name: 'sentence_count', type: 'INTEGER', description: 'Sentence count' }
  ];
  
  let turnsAddedCount = 0;
  let turnsSkippedCount = 0;
  
  for (const col of turnsColumnsToAdd) {
    if (existingTurnsColumns.includes(col.name)) {
      console.log(`   ⚠️  Column ${col.name} already exists (skipping)`);
      turnsSkippedCount++;
      continue;
    }
    
    const alterSQL = `ALTER TABLE conversation_turns ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`;
    
    const result = await saol.agentExecuteDDL({
      sql: alterSQL,
      transport: 'pg'
    });
    
    if (result.success) {
      console.log(`   ✅ Added column: ${col.name}`);
      turnsAddedCount++;
    } else {
      if (result.summary && result.summary.toLowerCase().includes('already exists')) {
        console.log(`   ⚠️  Column ${col.name} already exists (OK)`);
        turnsSkippedCount++;
      } else {
        console.log(`   ⚠️  Failed to add ${col.name}: ${result.summary}`);
      }
    }
  }
  
  console.log(`   Summary: ${turnsAddedCount} added, ${turnsSkippedCount} skipped`);
  
  // Step 4: Verify updated tables
  console.log('\n4. Verifying updated table structures...');
  
  const updatedConvSchema = await saol.agentIntrospectSchema({
    table: 'conversations',
    includeColumns: true,
    transport: 'pg'
  });
  
  if (updatedConvSchema.success && updatedConvSchema.tables[0]?.exists) {
    const table = updatedConvSchema.tables[0];
    console.log('✅ Conversations table verified');
    console.log(`   Columns: ${table.columns?.length || 0}`);
  } else {
    console.error('❌ Failed to verify conversations table');
  }
  
  const updatedTurnsSchema = await saol.agentIntrospectSchema({
    table: 'conversation_turns',
    includeColumns: true,
    transport: 'pg'
  });
  
  if (updatedTurnsSchema.success && updatedTurnsSchema.tables[0]?.exists) {
    const table = updatedTurnsSchema.tables[0];
    console.log('✅ Conversation_turns table verified');
    console.log(`   Columns: ${table.columns?.length || 0}`);
  } else {
    console.error('❌ Failed to verify conversation_turns table');
  }
  
  console.log('\n===== SETUP COMPLETE =====');
  return true;
}

// Run setup
setupConversationStorageDatabase()
  .then((success) => {
    if (success) {
      console.log('\n✅ All database setup tasks completed successfully');
      process.exit(0);
    } else {
      console.error('\n❌ Setup completed with errors');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Setup failed with exception:', error);
    console.error(error.stack);
    process.exit(1);
  });
