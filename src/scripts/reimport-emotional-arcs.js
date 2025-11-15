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

function loadNDJSON(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  return content.trim().split('\n').map(line => JSON.parse(line));
}

async function reimportArcs() {
  console.log('Reimporting emotional arcs with fixed references...');
  const arcs = loadNDJSON('./data/emotional-arcs-seed.ndjson');
  
  const { data, error } = await client
    .from('emotional_arcs')
    .upsert(arcs, { onConflict: 'arc_key' })
    .select();
  
  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
  
  console.log(`✓ Successfully reimported ${data.length} emotional arcs`);
}

reimportArcs();

