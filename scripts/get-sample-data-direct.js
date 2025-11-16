/**
 * Get sample scaffolding data to compare with TypeScript types
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get one persona
  const { data: personas } = await supabase
    .from('personas')
    .select('*')
    .limit(1);
  
  console.log('=== SAMPLE PERSONA ===');
  console.log(JSON.stringify(personas[0], null, 2));
  console.log('\n=== PERSONA KEYS ===');
  console.log(Object.keys(personas[0]).join(', '));
  
  // Get one emotional arc
  const { data: arcs } = await supabase
    .from('emotional_arcs')
    .select('*')
    .limit(1);
  
  console.log('\n\n=== SAMPLE EMOTIONAL ARC ===');
  console.log(JSON.stringify(arcs[0], null, 2));
  console.log('\n=== ARC KEYS ===');
  console.log(Object.keys(arcs[0]).join(', '));
  
  // Get one topic
  const { data: topics } = await supabase
    .from('training_topics')
    .select('*')
    .limit(1);
  
  console.log('\n\n=== SAMPLE TRAINING TOPIC ===');
  console.log(JSON.stringify(topics[0], null, 2));
  console.log('\n=== TOPIC KEYS ===');
  console.log(Object.keys(topics[0]).join(', '));
}

main().catch(console.error);
