#!/usr/bin/env node

/**
 * Check actual columns in conversations table
 * Using SAOL to safely inspect database schema
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local if it exists
const envPath = path.join(__dirname, '..', 'src', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Required environment variables not set:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  console.error('\nTo run this script, you need these variables in src/.env.local or as environment variables.');
  console.error('Alternatively, you can run this query directly in Supabase SQL Editor:');
  console.error('\n  SELECT column_name, data_type, is_nullable');
  console.error('  FROM information_schema.columns');
  console.error('  WHERE table_name = \'conversations\'');
  console.error('  ORDER BY ordinal_position;');
  process.exit(1);
}

const SAOL = require('../supa-agent-ops');

async function main() {
  console.log('🔍 Inspecting conversations table schema...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const saol = new SAOL(supabaseUrl, supabaseKey);
  
  try {
    // Get all columns for conversations table
    console.log('📊 Querying information_schema.columns...');
    const { data, error } = await saol.client
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'conversations')
      .order('ordinal_position');
    
    if (error) {
      console.error('❌ Error querying schema:', error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️  No columns found for conversations table');
      console.log('   The table may not exist or may have a different name.');
      return;
    }
    
    console.log(`\n✅ Found ${data.length} columns in conversations table:\n`);
    console.log('┌─────────────────────────────────┬─────────────────────┬──────────┬─────────────────┐');
    console.log('│ Column Name                     │ Data Type           │ Nullable │ Default         │');
    console.log('├─────────────────────────────────┼─────────────────────┼──────────┼─────────────────┤');
    
    // Look for the specific columns we're interested in
    const targetColumns = ['persona', 'emotional_arc', 'training_topic', 'persona_id', 'emotional_arc_id', 'training_topic_id'];
    const foundColumns = {};
    
    data.forEach(col => {
      const name = col.column_name.padEnd(31);
      const type = col.data_type.padEnd(19);
      const nullable = col.is_nullable === 'YES' ? 'YES' : 'NO';
      const nullablePad = nullable.padEnd(8);
      const def = (col.column_default || 'NULL').substring(0, 15).padEnd(15);
      
      console.log(`│ ${name} │ ${type} │ ${nullablePad} │ ${def} │`);
      
      // Track target columns
      if (targetColumns.includes(col.column_name)) {
        foundColumns[col.column_name] = {
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default
        };
      }
    });
    
    console.log('└─────────────────────────────────┴─────────────────────┴──────────┴─────────────────┘');
    
    // Analysis
    console.log('\n📋 Key Findings:');
    console.log('\nTarget columns status:');
    targetColumns.forEach(colName => {
      if (foundColumns[colName]) {
        const col = foundColumns[colName];
        console.log(`  ✓ ${colName}: ${col.type}, nullable=${col.nullable}`);
      } else {
        console.log(`  ✗ ${colName}: DOES NOT EXIST`);
      }
    });
    
    // Recommendations
    console.log('\n💡 Recommendations:');
    if (!foundColumns['emotional_arc']) {
      console.log('  • Column "emotional_arc" does not exist - this matches the error message');
      console.log('  • You may need to check if the column has a different name');
      console.log('  • Run: SELECT * FROM conversations LIMIT 1; to see actual column names');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.error(err.stack);
  }
}

main().catch(console.error);
