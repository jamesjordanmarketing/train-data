#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.resolve(__dirname, '../../.env.local');
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

async function testExecSql() {
  console.log('Testing exec_sql RPC function...\n');

  // Test 1: Simple SELECT
  console.log('Test 1: Simple SELECT');
  const { data: test1, error: error1 } = await supabase.rpc('exec_sql', {
    sql_script: 'SELECT COUNT(*) as count FROM conversations;'
  });

  if (error1) {
    console.error('  ❌ Error:', error1);
  } else {
    console.log('  ✅ Success:', test1);
  }

  // Test 2: Check current template count
  console.log('\nTest 2: Template count');
  const { data: test2, error: error2 } = await supabase.rpc('exec_sql', {
    sql_script: 'SELECT COUNT(*) as count FROM templates;'
  });

  if (error2) {
    console.error('  ❌ Error:', error2);
  } else {
    console.log('  ✅ Success:', test2);
  }

  // Test 3: Simple INSERT into a test scenario
  console.log('\nTest 3: Check if we can read templates');
  const { data: test3, error: error3 } = await supabase.rpc('exec_sql', {
    sql_script: "SELECT id, template_name FROM templates LIMIT 1;"
  });

  if (error3) {
    console.error('  ❌ Error:', error3);
  } else {
    console.log('  ✅ Success:', test3);
  }
}

testExecSql().catch(console.error);
