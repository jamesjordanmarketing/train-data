#!/usr/bin/env node

/**
 * Import Scaffolding Data Script - Direct Supabase Client
 * 
 * Imports personas, emotional arcs, and training topics into database using Supabase client directly
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
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

async function importPersonas() {
  console.log('\n=== IMPORTING PERSONAS ===');
  const personas = loadNDJSON('./data/personas-seed.ndjson');
  console.log(`Loaded ${personas.length} personas from file`);
  
  const { data, error } = await client
    .from('personas')
    .upsert(personas, { onConflict: 'persona_key' })
    .select();
  
  if (error) {
    console.error('✗ Error importing personas:', error.message);
    return false;
  }
  
  console.log(`✓ Successfully imported ${data.length} personas`);
  return true;
}

async function importEmotionalArcs() {
  console.log('\n=== IMPORTING EMOTIONAL ARCS ===');
  const arcs = loadNDJSON('./data/emotional-arcs-seed.ndjson');
  console.log(`Loaded ${arcs.length} emotional arcs from file`);
  
  const { data, error } = await client
    .from('emotional_arcs')
    .upsert(arcs, { onConflict: 'arc_key' })
    .select();
  
  if (error) {
    console.error('✗ Error importing emotional arcs:', error.message);
    console.error('Error details:', error);
    return false;
  }
  
  console.log(`✓ Successfully imported ${data.length} emotional arcs`);
  return true;
}

async function importTrainingTopics() {
  console.log('\n=== IMPORTING TRAINING TOPICS ===');
  const topics = loadNDJSON('./data/training-topics-seed.ndjson');
  console.log(`Loaded ${topics.length} training topics from file`);
  
  const { data, error} = await client
    .from('training_topics')
    .upsert(topics, { onConflict: 'topic_key' })
    .select();
  
  if (error) {
    console.error('✗ Error importing training topics:', error.message);
    console.error('Error details:', error);
    return false;
  }
  
  console.log(`✓ Successfully imported ${data.length} training topics`);
  return true;
}

async function main() {
  console.log('Starting scaffolding data import...');
  console.log('Environment:');
  console.log('- SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('- SERVICE_ROLE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  
  try {
    const personasSuccess = await importPersonas();
    const arcsSuccess = await importEmotionalArcs();
    const topicsSuccess = await importTrainingTopics();
    
    console.log('\n=== IMPORT SUMMARY ===');
    console.log('Personas:', personasSuccess ? '✓ Success' : '✗ Failed');
    console.log('Emotional Arcs:', arcsSuccess ? '✓ Success' : '✗ Failed');
    console.log('Training Topics:', topicsSuccess ? '✓ Success' : '✗ Failed');
    
    if (personasSuccess && arcsSuccess && topicsSuccess) {
      console.log('\n✓ All scaffolding data imported successfully!');
      process.exit(0);
    } else {
      console.log('\n✗ Some imports failed. See details above.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\nUnexpected error during import:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

