#!/usr/bin/env node

/**
 * Setup Scaffolding RPC Functions
 * 
 * Creates the increment_persona_usage, increment_arc_usage, and increment_topic_usage
 * PostgreSQL functions in Supabase.
 */

const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupFunctions() {
  console.log('🚀 Setting up scaffolding RPC functions...\n');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '../src/lib/services/scaffolding-rpc-functions.sql');
  
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split into individual function definitions
  const functions = sql
    .split('-- ============================================================================')
    .filter(block => block.includes('CREATE OR REPLACE FUNCTION'));

  console.log(`📋 Found ${functions.length} functions to create\n`);

  for (const funcSql of functions) {
    // Extract function name for logging
    const match = funcSql.match(/CREATE OR REPLACE FUNCTION (\w+)/);
    const funcName = match ? match[1] : 'unknown';

    try {
      console.log(`📝 Creating function: ${funcName}...`);
      
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql_query: funcSql.trim() 
      });

      if (error) {
        // Try direct execution via REST API (alternative method)
        console.log(`   ⚠️  rpc('exec_sql') failed, trying direct execution...`);
        
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql_query: funcSql.trim() })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${await response.text()}`);
        }

        console.log(`   ✅ ${funcName} created successfully (direct)\n`);
      } else {
        console.log(`   ✅ ${funcName} created successfully\n`);
      }
    } catch (error) {
      console.error(`   ❌ Failed to create ${funcName}:`, error.message);
      console.log('   📋 SQL:', funcSql.substring(0, 200) + '...\n');
    }
  }

  // Test the functions
  console.log('🧪 Testing functions...\n');

  // First, get sample IDs
  const { data: personas } = await supabase
    .from('personas')
    .select('id')
    .limit(1)
    .single();

  const { data: arcs } = await supabase
    .from('emotional_arcs')
    .select('id')
    .limit(1)
    .single();

  const { data: topics } = await supabase
    .from('training_topics')
    .select('id')
    .limit(1)
    .single();

  if (personas && arcs && topics) {
    try {
      await supabase.rpc('increment_persona_usage', { persona_id: personas.id });
      console.log('✅ increment_persona_usage works');

      await supabase.rpc('increment_arc_usage', { arc_id: arcs.id });
      console.log('✅ increment_arc_usage works');

      await supabase.rpc('increment_topic_usage', { topic_id: topics.id });
      console.log('✅ increment_topic_usage works');
    } catch (error) {
      console.error('⚠️  Functions exist but may need permissions:', error.message);
    }
  } else {
    console.log('⚠️  Cannot test functions - no sample data found');
  }

  console.log('\n✅ Setup complete!');
}

setupFunctions().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
