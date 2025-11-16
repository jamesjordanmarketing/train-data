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

async function checkTemplate() {
  console.log('🔍 Checking shame_to_acceptance template...\n');

  const { data, error } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('emotional_arc_type', 'shame_to_acceptance');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!data || data.length === 0) {
    console.log('❌ No templates found for shame_to_acceptance');
    return;
  }

  console.log(`✅ Found ${data.length} template(s) for shame_to_acceptance:\n`);
  data.forEach(t => {
    console.log(`Template: ${t.template_name}`);
    console.log(`  ID: ${t.id}`);
    console.log(`  Arc Type: ${t.emotional_arc_type}`);
    console.log(`  Tier: ${t.tier}`);
    console.log(`  Is Active: ${t.is_active ? '✅ YES' : '❌ NO'}`);
    console.log(`  Suitable Personas: ${t.suitable_personas ? t.suitable_personas.join(', ') : 'None specified'}`);
    console.log(`  Suitable Topics: ${t.suitable_topics ? t.suitable_topics.slice(0, 5).join(', ') + (t.suitable_topics.length > 5 ? '...' : '') : 'None specified'}`);
    console.log('');
  });
}

checkTemplate();
