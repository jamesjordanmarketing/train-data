#!/usr/bin/env node

/**
 * Supabase Access Test
 * Actions: read | write | edit | cleanup
 * Uses service role key and prints PASS or HARD BLOCK per action
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Load envs from .env.local (consistent with existing scripts)
function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  if (!fs.existsSync(envPath)) {
    return { error: `❌ .env.local not found at ${envPath}` };
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    if (key && value) envVars[key.trim()] = value.trim();
  });
  return { envVars };
}

function makeClient(envVars) {
  const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    const missing = [
      !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !key ? 'SUPABASE_SERVICE_ROLE_KEY' : null
    ].filter(Boolean).join(', ');
    return { error: `❌ Missing env(s): ${missing}` };
  }
  try {
    const supabase = createClient(url, key, { auth: { persistSession: false } });
    return { supabase };
  } catch (e) {
    return { error: `❌ Failed to create client: ${e.message}` };
  }
}

function nowIso() {
  return new Date().toISOString();
}

function hardBlock(message) {
  console.log(`\nFinal status summary: HARD BLOCK`);
  console.log(message);
  process.exitCode = 2;
}

function passSummary() {
  console.log(`\nFinal status summary: PASS`);
}

function isAuthOrPolicyError(err) {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  return msg.includes('invalid api key')
    || msg.includes('unauthorized')
    || msg.includes('permission')
    || msg.includes('rls')
    || msg.includes('access')
    || msg.includes('forbidden');
}

// Count helper
async function countTable(supabase, table) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true });
  return { count: count ?? 0, error };
}

// Try JSONB contains first, then text equality
async function fetchAccessTestRows(supabase) {
  // Attempt JSONB contains
  let { data, error } = await supabase
    .from('templates')
    .select('id, description, created_by')
    .contains('created_by', { id: 'access_test' });

  if (error) {
    // Fallback to text equality
    const { data: dataText, error: errorText } = await supabase
      .from('templates')
      .select('id, description, created_by')
      .eq('created_by', 'access_test');
    return { data: dataText, error: errorText };
  }
  return { data, error };
}

async function deleteAccessTestRows(supabase) {
  // Try JSONB contains delete
  let { error } = await supabase
    .from('templates')
    .delete()
    .contains('created_by', { id: 'access_test' });

  if (error) {
    // Fallback to text equality delete
    const { error: errorText } = await supabase
      .from('templates')
      .delete()
      .eq('created_by', 'access_test');
    return { error: errorText };
  }
  return { error: null };
}

async function actionRead(supabase) {
  console.log('📖 Read test: counting templates and conversations');
  const t = await countTable(supabase, 'templates');
  const c = await countTable(supabase, 'conversations');

  if (t.error) {
    console.log('❌ Templates count error:', t.error.message || t.error);
    if (isAuthOrPolicyError(t.error)) return hardBlock('Cease: read blocked due to auth/policy.');
  } else {
    console.log(`Templates count: ${t.count}`);
  }

  if (c.error) {
    console.log('❌ Conversations count error:', c.error.message || c.error);
    if (isAuthOrPolicyError(c.error)) return hardBlock('Cease: read blocked due to auth/policy.');
  } else {
    console.log(`Conversations count: ${c.count}`);
  }

  passSummary();
}

async function actionWrite(supabase) {
  console.log('📝 Write test: insert → update → delete a test row');

  // Counts before
  const before = await countTable(supabase, 'templates');
  if (before.error) {
    console.log('❌ Count error (before):', before.error.message || before.error);
    if (isAuthOrPolicyError(before.error)) return hardBlock('Cease: write blocked due to auth/policy.');
  } else {
    console.log(`Templates count (before): ${before.count}`);
  }

  const id = crypto.randomUUID();
  const ts = nowIso();
  const baseTemplate = {
    id,
    template_name: `access_test_template_${Date.now()}`,
    category: 'access_test',
    description: 'Initial description (write test)',
    is_active: true,
    // Prefer JSONB shape if supported
    created_by: { id: 'access_test', name: 'Supabase Access Test', type: 'service' },
    last_modified_by: { id: 'access_test', name: 'Supabase Access Test' },
    created_at: ts,
    updated_at: ts,
    last_modified: ts
  };

  // Insert
  let { data: insertData, error: insertError } = await supabase
    .from('templates')
    .insert(baseTemplate)
    .select();

  if (insertError) {
    console.log('❌ Insert error:', insertError.message || insertError);
    if (isAuthOrPolicyError(insertError)) return hardBlock('Cease: write blocked due to auth/policy.');
    // Try fallback with text created_by
    console.log('↺ Retrying insert with text created_by fallback...');
    const fallbackTemplate = { ...baseTemplate };
    fallbackTemplate.created_by = 'access_test';
    fallbackTemplate.last_modified_by = 'access_test';
    ({ data: insertData, error: insertError } = await supabase
      .from('templates')
      .insert(fallbackTemplate)
      .select());
    if (insertError) {
      console.log('❌ Insert fallback error:', insertError.message || insertError);
      return hardBlock('Cease: write failed due to schema constraints.');
    }
  }
  console.log('✅ Inserted:', JSON.stringify(insertData, null, 2));

  // Update description
  const { data: updateData, error: updateError } = await supabase
    .from('templates')
    .update({ description: 'Updated description (write test)', updated_at: nowIso(), last_modified: nowIso() })
    .eq('id', id)
    .select();

  if (updateError) {
    console.log('❌ Update error:', updateError.message || updateError);
    if (isAuthOrPolicyError(updateError)) return hardBlock('Cease: write update blocked due to auth/policy.');
  } else {
    console.log('✅ Updated:', JSON.stringify(updateData, null, 2));
  }

  // Delete the test row (per prompt)
  const { error: deleteError } = await supabase
    .from('templates')
    .delete()
    .eq('id', id);

  if (deleteError) {
    console.log('❌ Delete error:', deleteError.message || deleteError);
    if (isAuthOrPolicyError(deleteError)) return hardBlock('Cease: delete blocked due to auth/policy.');
  } else {
    console.log(`✅ Deleted test row id=${id}`);
  }

  // Counts after
  const after = await countTable(supabase, 'templates');
  if (after.error) {
    console.log('❌ Count error (after):', after.error.message || after.error);
  } else {
    console.log(`Templates count (after): ${after.count}`);
  }

  passSummary();
}

async function actionEdit(supabase) {
  console.log('✏️ Edit test: update an existing row with created_by="access_test"');

  // Find existing row; if none, create one
  let { data: rows, error } = await fetchAccessTestRows(supabase);
  if (error) {
    console.log('❌ Search error:', error.message || error);
    if (isAuthOrPolicyError(error)) return hardBlock('Cease: edit blocked due to auth/policy.');
  }

  let targetId = rows && rows.length ? rows[0].id : null;

  if (!targetId) {
    console.log('ℹ️ No existing "access_test" row found. Creating one...');
    const id = crypto.randomUUID();
    const ts = nowIso();
    const createTemplate = {
      id,
      template_name: `access_test_template_${Date.now()}`,
      category: 'access_test',
      description: 'Initial description (edit test)',
      is_active: true,
      created_by: { id: 'access_test', name: 'Supabase Access Test', type: 'service' },
      last_modified_by: { id: 'access_test', name: 'Supabase Access Test' },
      created_at: ts,
      updated_at: ts,
      last_modified: ts
    };

    let { error: createError } = await supabase
      .from('templates')
      .insert(createTemplate);

    if (createError) {
      console.log('❌ Create error:', createError.message || createError);
      if (isAuthOrPolicyError(createError)) return hardBlock('Cease: edit create blocked due to auth/policy.');
      // Fallback to text created_by
      console.log('↺ Retrying create with text created_by fallback...');
      createTemplate.created_by = 'access_test';
      createTemplate.last_modified_by = 'access_test';
      const { error: createError2 } = await supabase
        .from('templates')
        .insert(createTemplate);
      if (createError2) {
        console.log('❌ Create fallback error:', createError2.message || createError2);
        return hardBlock('Cease: edit cannot create test row due to schema constraints.');
      }
    }
    targetId = id;
    console.log(`✅ Created test row id=${targetId}`);
  }

  // Perform edit
  const { data: updateData, error: updateError } = await supabase
    .from('templates')
    .update({ description: 'Updated description (edit test)', updated_at: nowIso(), last_modified: nowIso() })
    .eq('id', targetId)
    .select();

  if (updateError) {
    console.log('❌ Edit update error:', updateError.message || updateError);
    if (isAuthOrPolicyError(updateError)) return hardBlock('Cease: edit update blocked due to auth/policy.');
  } else {
    console.log('✅ Edit updated:', JSON.stringify(updateData, null, 2));
  }

  passSummary();
}

async function actionCleanup(supabase) {
  console.log('🧹 Cleanup: delete rows with created_by="access_test"');
  const { error } = await deleteAccessTestRows(supabase);
  if (error) {
    console.log('❌ Cleanup error:', error.message || error);
    if (isAuthOrPolicyError(error)) return hardBlock('Cease: cleanup blocked due to auth/policy.');
  } else {
    console.log('✅ Cleanup completed');
  }
  passSummary();
}

async function main() {
  const action = (process.argv[2] || '').toLowerCase();
  if (!action || !['read', 'write', 'edit', 'cleanup'].includes(action)) {
    console.log('Usage: node src\\scripts\\supabase-access-test.js <read|write|edit|cleanup>');
    process.exit(1);
  }

  const { envVars, error: envError } = loadEnv();
  if (envError) return hardBlock(`Cease: ${envError}`);
  const { supabase, error: clientError } = makeClient(envVars);
  if (clientError) return hardBlock(`Cease: ${clientError}`);

  try {
    if (action === 'read') return await actionRead(supabase);
    if (action === 'write') return await actionWrite(supabase);
    if (action === 'edit') return await actionEdit(supabase);
    if (action === 'cleanup') return await actionCleanup(supabase);
  } catch (e) {
    console.log('❌ Unexpected error:', e?.message || e);
    return hardBlock('Cease: unexpected failure during operation.');
  }
}

if (require.main === module) {
  main();
}