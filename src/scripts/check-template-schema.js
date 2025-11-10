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

async function checkSchema() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_script: `
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'templates'
      ORDER BY ordinal_position;
    `
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Templates table schema:');
    console.log(JSON.stringify(data, null, 2));
  }
}

checkSchema().catch(console.error);
