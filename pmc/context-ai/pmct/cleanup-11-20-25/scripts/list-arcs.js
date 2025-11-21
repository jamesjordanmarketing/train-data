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

async function listArcs() {
  const { data, error } = await supabase
    .from('emotional_arcs')
    .select('arc_key, name, is_active')
    .order('name');
  
  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('🎭 Emotional Arcs in database:\n');
  data.forEach(arc => {
    const status = arc.is_active ? '🟢' : '⚫';
    console.log(`${status} ${arc.arc_key.padEnd(35)} | ${arc.name}`);
  });
  console.log(`\nTotal: ${data.length} arcs`);
}

listArcs();
