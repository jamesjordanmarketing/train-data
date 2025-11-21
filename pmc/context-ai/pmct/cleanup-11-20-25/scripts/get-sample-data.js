/**
 * Get sample scaffolding data to compare with TypeScript types
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const saolModule = require(path.resolve(__dirname, '../supa-agent-ops/dist/index.js'));
const SupabaseAgentOpsLibrary = saolModule.SupabaseAgentOpsLibrary || saolModule.default || saolModule;

async function main() {
  const saol = new SupabaseAgentOpsLibrary({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  // Get one persona
  const personaResult = await saol.executeQuery(`
    SELECT * FROM personas LIMIT 1
  `);
  
  console.log('=== SAMPLE PERSONA ===');
  console.log(JSON.stringify(personaResult.data[0], null, 2));
  
  // Get one emotional arc
  const arcResult = await saol.executeQuery(`
    SELECT * FROM emotional_arcs LIMIT 1
  `);
  
  console.log('\n=== SAMPLE EMOTIONAL ARC ===');
  console.log(JSON.stringify(arcResult.data[0], null, 2));
  
  // Get one topic
  const topicResult = await saol.executeQuery(`
    SELECT * FROM training_topics LIMIT 1
  `);
  
  console.log('\n=== SAMPLE TRAINING TOPIC ===');
  console.log(JSON.stringify(topicResult.data[0], null, 2));
}

main().catch(console.error);
