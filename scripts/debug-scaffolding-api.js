#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log('ENV check:', {
  hasUrl: !!process.env.SUPABASE_URL,
  hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

const saol = require('../supa-agent-ops');

async function checkScaffoldingTables() {
  console.log('=== Checking Scaffolding Tables ===\n');

  // Check counts
  console.log('1. Checking record counts...');
  const personas = await saol.agentCount({ table: 'personas' });
  const arcs = await saol.agentCount({ table: 'emotional_arcs' });
  const topics = await saol.agentCount({ table: 'training_topics' });

  console.log('   Personas:', personas.count);
  console.log('   Emotional Arcs:', arcs.count);
  console.log('   Training Topics:', topics.count);

  // Check schema
  console.log('\n2. Checking personas schema...');
  const personasSchema = await saol.agentIntrospectSchema({
    table: 'personas',
    includeColumns: true
  });
  
  if (personasSchema.tables && personasSchema.tables[0]) {
    const cols = personasSchema.tables[0].columns.map(c => c.name);
    console.log('   Columns:', cols.join(', '));
  }

  // Get sample data
  console.log('\n3. Getting sample persona...');
  const personaSample = await saol.agentQuery({
    table: 'personas',
    limit: 1
  });
  
  if (personaSample.data && personaSample.data[0]) {
    console.log('   Sample:', JSON.stringify(personaSample.data[0], null, 2));
  }

  console.log('\n4. Checking emotional_arcs schema...');
  const arcsSchema = await saol.agentIntrospectSchema({
    table: 'emotional_arcs',
    includeColumns: true
  });
  
  if (arcsSchema.tables && arcsSchema.tables[0]) {
    const cols = arcsSchema.tables[0].columns.map(c => c.name);
    console.log('   Columns:', cols.join(', '));
  }

  console.log('\n5. Checking training_topics schema...');
  const topicsSchema = await saol.agentIntrospectSchema({
    table: 'training_topics',
    includeColumns: true
  });
  
  if (topicsSchema.tables && topicsSchema.tables[0]) {
    const cols = topicsSchema.tables[0].columns.map(c => c.name);
    console.log('   Columns:', cols.join(', '));
  }

  // Check what the API expects
  console.log('\n6. Testing API format expectations...');
  const personasQuery = await saol.agentQuery({
    table: 'personas',
    limit: 1
  });

  const arcsQuery = await saol.agentQuery({
    table: 'emotional_arcs',
    limit: 1
  });

  const topicsQuery = await saol.agentQuery({
    table: 'training_topics',
    limit: 1
  });

  console.log('   Personas data shape:', personasQuery.data ? Object.keys(personasQuery.data[0] || {}).join(', ') : 'no data');
  console.log('   Arcs data shape:', arcsQuery.data ? Object.keys(arcsQuery.data[0] || {}).join(', ') : 'no data');
  console.log('   Topics data shape:', topicsQuery.data ? Object.keys(topicsQuery.data[0] || {}).join(', ') : 'no data');
}

checkScaffoldingTables().catch(console.error);
