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

async function insertTemplate() {
  console.log('Reading fixed template SQL...\n');

  const sql = fs.readFileSync(
    path.join(__dirname, 'generated-sql/insert-templates-fixed.sql'),
    'utf8'
  );

  console.log('Executing SQL via exec_sql RPC...\n');

  const { data, error } = await supabase.rpc('exec_sql', {
    sql_script: sql
  });

  if (error) {
    console.error('❌ Error:', error);
    return false;
  }

  console.log('✅ Template inserted successfully!');
  return true;
}

insertTemplate().catch(console.error);
