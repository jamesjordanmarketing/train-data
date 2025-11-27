const { createClient } = require('./src/node_modules/@supabase/supabase-js');
require('./src/node_modules/dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NIL_UUID = '00000000-0000-0000-0000-000000000000';

// Exact copy of autoSelectTemplate from process-next route
async function autoSelectTemplate(emotionalArcId, tier) {
  try {
    // Get the arc_key from emotional_arcs table
    const { data: arcData, error: arcError } = await supabase
      .from('emotional_arcs')
      .select('arc_key')
      .eq('id', emotionalArcId)
      .single();

    if (arcError || !arcData) {
      console.log(`[ProcessNext] Emotional arc not found: ${emotionalArcId}`, arcError);
      return null;
    }

    const arcType = arcData.arc_key;
    console.log(`[ProcessNext] Looking for template with arc_type: ${arcType}, tier: ${tier}`);

    // Find a template with matching emotional_arc_type
    let query = supabase
      .from('prompt_templates')
      .select('id')
      .eq('emotional_arc_type', arcType);

    if (tier) {
      query = query.eq('tier', tier);
    }

    const { data: templateData, error: templateError } = await query.limit(1).single();

    if (templateError || !templateData) {
      console.log('Template query error:', templateError);
      
      // Try without tier filter
      const { data: anyTierData, error: anyTierError } = await supabase
        .from('prompt_templates')
        .select('id')
        .eq('emotional_arc_type', arcType)
        .limit(1)
        .single();

      if (anyTierError || !anyTierData) {
        console.warn(`[ProcessNext] No template found for arc_type=${arcType}`, anyTierError);
        return null;
      }

      console.log(`[ProcessNext] Auto-selected template ${anyTierData.id} (any tier) for arc ${arcType}`);
      return anyTierData.id;
    }

    console.log(`[ProcessNext] Auto-selected template ${templateData.id} for arc ${arcType}, tier ${tier}`);
    return templateData.id;

  } catch (error) {
    console.error(`[ProcessNext] Error auto-selecting template:`, error);
    return null;
  }
}

async function test() {
  // Get batch items 
  const { data: items } = await supabase
    .from('batch_items')
    .select('*')
    .eq('batch_job_id', '5ed3f1af-bf67-4ec7-b0ea-74dfae688fe4');
  
  console.log('Testing auto-select for each item:\\n');
  
  for (const item of items || []) {
    const emotionalArcId = item.parameters?.emotional_arc_id;
    const tier = item.tier;
    
    console.log(`\\n=== Item ${item.id.slice(0,8)} ===`);
    console.log('emotional_arc_id:', emotionalArcId);
    console.log('tier:', tier);
    
    if (emotionalArcId) {
      const templateId = await autoSelectTemplate(emotionalArcId, tier);
      console.log('Result:', templateId ? `SUCCESS: ${templateId}` : 'FAILED');
    } else {
      console.log('MISSING emotional_arc_id!');
    }
  }
}

test().catch(console.error);

test().catch(console.error);
