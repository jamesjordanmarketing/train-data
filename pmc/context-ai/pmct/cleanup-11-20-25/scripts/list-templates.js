#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function listTemplates() {
  const { data, error } = await supabase
    .from('prompt_templates')
    .select('template_name, emotional_arc_type, is_active')
    .order('emotional_arc_type');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('📋 Templates in database:\n');
  data.forEach(t => {
    const status = t.is_active ? '✅' : '❌';
    console.log(`${status} ${t.emotional_arc_type.padEnd(35)} | ${t.template_name}`);
  });
  console.log(`\n Total: ${data.length} templates`);
}

listTemplates();
