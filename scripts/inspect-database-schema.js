#!/usr/bin/env node
/**
 * Inspect Database Schema using SAOL
 * This script uses SAOL to introspect the actual database schema
 */

// Load environment from src/.env.local if it exists
const fs = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '..', 'src', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const saol = require('../supa-agent-ops');

async function inspectDatabase() {
  console.log('🔍 Inspecting database schema with SAOL...\n');
  
  // Check environment
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL not set');
    process.exit(1);
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
    process.exit(1);
  }
  
  console.log('✅ Environment variables loaded\n');
  
  try {
    // Step 1: Get list of all tables
    console.log('📋 Step 1: Getting list of tables...');
    const schemaResult = await saol.agentIntrospectSchema({
      includeColumns: false,
      includeIndexes: false
    });
    
    if (!schemaResult.success) {
      console.error('❌ Failed to get tables:', schemaResult.error);
      console.error('Next actions:', schemaResult.nextActions);
      return;
    }
    
    const tableNames = schemaResult.tables.map(t => t.name);
    console.log(`Found ${tableNames.length} tables:`, tableNames.join(', '));
    console.log();
    
    // Step 2: Check if conversations table exists
    const hasConversations = tableNames.includes('conversations');
    const hasConversationStorage = tableNames.includes('conversation_storage');
    
    console.log('📊 Conversation tables:');
    console.log('  - conversations:', hasConversations ? '✅ EXISTS' : '❌ MISSING');
    console.log('  - conversation_storage:', hasConversationStorage ? '✅ EXISTS' : '❌ MISSING');
    console.log();
    
    // Step 3: Inspect the table that exists
    const tableToInspect = hasConversations ? 'conversations' : 
                          hasConversationStorage ? 'conversation_storage' : null;
    
    if (!tableToInspect) {
      console.error('❌ No conversation table found!');
      console.log('\n💡 Need to create conversations table');
      return;
    }
    
    console.log(`🔍 Step 2: Inspecting ${tableToInspect} schema...`);
    const tableSchema = await saol.agentIntrospectSchema({
      table: tableToInspect,
      includeColumns: true,
      includeIndexes: true
    });
    
    if (!tableSchema.success) {
      console.error('❌ Failed to inspect table:', tableSchema.error);
      return;
    }
    
    const table = tableSchema.tables[0];
    console.log(`\n📋 Table: ${table.name}`);
    console.log(`Columns: ${table.columns.length}`);
    console.log();
    
    // Show columns with their properties
    console.log('📝 Column details:');
    table.columns.forEach(col => {
      const nullable = col.isNullable ? 'NULL' : 'NOT NULL';
      const hasDefault = col.defaultValue ? `DEFAULT ${col.defaultValue}` : '';
      console.log(`  ${col.name.padEnd(30)} ${col.dataType.padEnd(20)} ${nullable.padEnd(10)} ${hasDefault}`);
    });
    
    // Step 4: Check for required columns
    console.log('\n✅ Checking for required columns:');
    const requiredColumns = [
      'conversation_id',
      'raw_response_path',
      'raw_response_url',
      'parse_method_used',
      'persona',
      'emotional_arc',
      'training_topic'
    ];
    
    requiredColumns.forEach(col => {
      const exists = table.columns.find(c => c.name === col);
      if (exists) {
        const nullable = exists.isNullable ? '(nullable)' : '(NOT NULL)';
        console.log(`  ✅ ${col.padEnd(25)} ${nullable}`);
      } else {
        console.log(`  ❌ ${col.padEnd(25)} MISSING`);
      }
    });
    
    // Step 5: Check current data
    console.log('\n📊 Step 3: Checking table data...');
    const countResult = await saol.agentCount({
      table: tableToInspect
    });
    
    if (countResult.success) {
      console.log(`Total records: ${countResult.count}`);
      
      if (countResult.count > 0) {
        // Get a sample record
        const sampleResult = await saol.agentQuery({
          table: tableToInspect,
          limit: 1
        });
        
        if (sampleResult.success && sampleResult.data.length > 0) {
          console.log('\n📄 Sample record fields:');
          const record = sampleResult.data[0];
          Object.keys(record).forEach(key => {
            const value = record[key];
            const type = typeof value;
            const preview = value ? String(value).substring(0, 50) : 'null';
            console.log(`  ${key.padEnd(30)} ${type.padEnd(10)} ${preview}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  }
}

// Run inspection
inspectDatabase()
  .then(() => {
    console.log('\n✅ Inspection complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
