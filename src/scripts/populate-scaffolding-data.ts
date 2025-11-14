/**
 * Populate Scaffolding Data Script
 * 
 * This script populates the personas, emotional_arcs, and training_topics tables
 * with seed data extracted from the c-alpha-build specification.
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { PERSONAS_SEED, EMOTIONAL_ARCS_SEED, TRAINING_TOPICS_SEED } from './scaffolding-seed-data';

// ============================================================================
// Environment Setup
// ============================================================================

function loadEnv() {
  const envPath = path.resolve(__dirname, '../../.env.local');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local file not found');
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars: Record<string, string> = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  return envVars;
}

// ============================================================================
// Population Functions
// ============================================================================

async function populateScaffoldingData() {
  console.log('🚀 Starting scaffolding data population...\n');

  const envVars = loadEnv();
  const supabase = createClient(
    envVars.SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // 1. Populate personas
    console.log('📋 1. Populating personas...');
    let personasInserted = 0;
    let personasSkipped = 0;

    for (const persona of PERSONAS_SEED) {
      const { data, error } = await supabase
        .from('personas')
        .upsert(persona, { 
          onConflict: 'persona_type,domain',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`   ❌ Failed to insert persona ${persona.persona_type}:`, error.message);
        personasSkipped++;
      } else {
        console.log(`   ✅ Inserted persona: ${persona.name}`);
        personasInserted++;
      }
    }

    console.log(`   📊 Personas: ${personasInserted} inserted, ${personasSkipped} skipped\n`);

    // 2. Populate emotional arcs
    console.log('📋 2. Populating emotional arcs...');
    let arcsInserted = 0;
    let arcsSkipped = 0;

    for (const arc of EMOTIONAL_ARCS_SEED) {
      const { data, error } = await supabase
        .from('emotional_arcs')
        .upsert(arc, { 
          onConflict: 'arc_type',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`   ❌ Failed to insert arc ${arc.arc_type}:`, error.message);
        arcsSkipped++;
      } else {
        console.log(`   ✅ Inserted arc: ${arc.name}`);
        arcsInserted++;
      }
    }

    console.log(`   📊 Emotional Arcs: ${arcsInserted} inserted, ${arcsSkipped} skipped\n`);

    // 3. Populate training topics
    console.log('📋 3. Populating training topics...');
    let topicsInserted = 0;
    let topicsSkipped = 0;

    for (const topic of TRAINING_TOPICS_SEED) {
      const { data, error} = await supabase
        .from('training_topics')
        .upsert(topic, { 
          onConflict: 'topic_key,domain',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`   ❌ Failed to insert topic ${topic.topic_key}:`, error.message);
        topicsSkipped++;
      } else {
        console.log(`   ✅ Inserted topic: ${topic.name}`);
        topicsInserted++;
      }
    }

    console.log(`   📊 Training Topics: ${topicsInserted} inserted, ${topicsSkipped} skipped\n`);

    console.log('✅ Scaffolding data population complete!\n');

    // 4. Verify counts
    console.log('📊 4. Verifying final counts...');
    
    const { count: personaCount, error: personaError } = await supabase
      .from('personas')
      .select('*', { count: 'exact', head: true });

    const { count: arcCount, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('*', { count: 'exact', head: true });

    const { count: topicCount, error: topicError } = await supabase
      .from('training_topics')
      .select('*', { count: 'exact', head: true });

    if (personaError || arcError || topicError) {
      console.error('   ⚠️  Error verifying counts');
    } else {
      console.log(`\n📈 Final database counts:`);
      console.log(`   - Personas: ${personaCount}`);
      console.log(`   - Emotional Arcs: ${arcCount}`);
      console.log(`   - Training Topics: ${topicCount}`);
    }

    console.log('\n🎉 All done!');

  } catch (error) {
    console.error('\n❌ Error during population:', error);
    throw error;
  }
}

// ============================================================================
// Execute
// ============================================================================

if (require.main === module) {
  populateScaffoldingData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { populateScaffoldingData };

