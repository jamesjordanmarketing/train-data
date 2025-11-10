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

async function checkRequiredFields() {
  console.log('Checking templates table required fields...\n');

  // Try inserting a minimal record to see what's required
  const minimalTemplate = {
    id: '00000000-0000-0000-0000-000000000001',
    template_name: 'Test Template',
    category: 'test'
  };

  const { data, error } = await supabase
    .from('templates')
    .insert(minimalTemplate)
    .select();

  if (error) {
    console.log('Error response tells us what\'s required:');
    console.log(JSON.stringify(error, null, 2));

    // Try to delete if it was partially created
    await supabase
      .from('templates')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000001');
  } else {
    console.log('Minimal insert succeeded!');
    console.log('Data:', JSON.stringify(data, null, 2));

    // Clean up
    await supabase
      .from('templates')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000001');
  }
}

checkRequiredFields().catch(console.error);
