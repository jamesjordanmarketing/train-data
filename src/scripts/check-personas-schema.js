#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data, error } = await client
    .from('information_schema.columns')
    .select('column_name, data_type, character_maximum_length')
    .eq('table_name', 'personas')
    .order('ordinal_position');
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  
  console.log('Personas Table Schema:');
  console.log('======================\n');
  data.forEach(col => {
    const maxLen = col.character_maximum_length ? ` (${col.character_maximum_length})` : '';
    console.log(`${col.column_name}: ${col.data_type}${maxLen}`);
  });
}

checkSchema();

