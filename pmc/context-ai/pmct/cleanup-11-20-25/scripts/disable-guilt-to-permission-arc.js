#!/usr/bin/env node

/**
 * Disable guilt_to_permission arc temporarily until template is created
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function disableArc() {
  console.log('🔍 Checking guilt_to_permission arc...\n');

  try {
    // Check current status
    const { data: arcs, error: queryError } = await supabase
      .from('emotional_arcs')
      .select('*')
      .eq('arc_key', 'guilt_to_permission')
      .limit(1);

    if (queryError) {
      console.error('❌ Query error:', queryError.message);
      return;
    }

    if (!arcs || arcs.length === 0) {
      console.log('⚠️  guilt_to_permission arc not found in database');
      return;
    }

    const arc = arcs[0];
    console.log(`Found arc: ${arc.name} (${arc.arc_key})`);
    console.log(`Current status: is_active = ${arc.is_active}\n`);

    if (!arc.is_active) {
      console.log('✅ Arc is already disabled. No action needed.');
      return;
    }

    // Disable it
    console.log('🔧 Disabling arc...');
    const { error: updateError } = await supabase
      .from('emotional_arcs')
      .update({ is_active: false })
      .eq('id', arc.id);

    if (updateError) {
      console.error('❌ Update error:', updateError.message);
      return;
    }

    console.log('✅ Successfully disabled guilt_to_permission arc');
    console.log('\nℹ️  This arc will not appear in the UI until you:');
    console.log('   1. Create a template for guilt_to_permission');
    console.log('   2. Populate it with: node src/scripts/populate-templates.js');
    console.log('   3. Re-enable this arc by setting is_active = true');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

disableArc();
