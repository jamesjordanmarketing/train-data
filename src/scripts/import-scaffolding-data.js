#!/usr/bin/env node

/**
 * Import Scaffolding Data Script
 * 
 * Imports personas, emotional arcs, and training topics into database using SAOL
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

// Set environment variables for SAOL
process.env.SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

// Now require SAOL after setting environment variables
const saol = require('../../supa-agent-ops');

async function importPersonas() {
  console.log('\n=== IMPORTING PERSONAS ===');
  const result = await saol.agentImportTool({
    source: './data/personas-seed.ndjson',
    table: 'personas',
    mode: 'upsert',
    onConflict: 'persona_key'
  });
  
  console.log(result.summary);
  if (result.details) {
    console.log('Rows affected:', result.details.rowsAffected || result.details.count || 'N/A');
  }
  return result.success;
}

async function importEmotionalArcs() {
  console.log('\n=== IMPORTING EMOTIONAL ARCS ===');
  const result = await saol.agentImportTool({
    source: './data/emotional-arcs-seed.ndjson',
    table: 'emotional_arcs',
    mode: 'upsert',
    onConflict: 'arc_key'
  });
  
  console.log(result.summary);
  if (result.details) {
    console.log('Rows affected:', result.details.rowsAffected || result.details.count || 'N/A');
  }
  return result.success;
}

async function importTrainingTopics() {
  console.log('\n=== IMPORTING TRAINING TOPICS ===');
  const result = await saol.agentImportTool({
    source: './data/training-topics-seed.ndjson',
    table: 'training_topics',
    mode: 'upsert',
    onConflict: 'topic_key'
  });
  
  console.log(result.summary);
  if (result.details) {
    console.log('Rows affected:', result.details.rowsAffected || result.details.count || 'N/A');
  }
  return result.success;
}

async function main() {
  console.log('Starting scaffolding data import...\n');
  console.log('Environment:');
  console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  
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
    console.error('\nError during import:', error.message);
    process.exit(1);
  }
}

main();

