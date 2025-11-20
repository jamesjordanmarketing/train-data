/**
 * Setup Test Conversation for Enrichment Testing
 * 
 * This script creates a minimal test conversation in the database
 * so that the enrichment service can fetch metadata and enrich it.
 */

// Load environment variables from .env.local
require('./load-env.js');

import { createClient } from '@supabase/supabase-js';

// Environment variables (loaded by load-env.js)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTestConversation() {
  console.log('\n=== Setting Up Test Conversation ===\n');

  try {
    const conversationId = 'test-conv-001';
    
    // Step 1: Get a real user ID from the database
    console.log('1. Finding a valid user ID...');
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    let userId: string | null = null;
    if (users && users.id) {
      userId = users.id;
      console.log(`   ✅ Using user ID: ${userId}`);
    } else {
      console.log('   ⚠️  No users found, will set created_by to null');
    }

    // Step 2: Check if conversation already exists
    console.log('2. Checking if test conversation exists...');
    const { data: existing } = await supabase
      .from('conversations')
      .select('conversation_id')
      .eq('conversation_id', conversationId)
      .maybeSingle();

    if (existing) {
      console.log('   ⚠️  Conversation already exists, will update it.');
    }

    // Step 3: Create or update minimal conversation record
    console.log('3. Creating/updating conversation record...');
    
    const conversationData = {
      conversation_id: conversationId,
      conversation_name: 'Test Conversation - Marcus Debt Shame',
      description: 'Test conversation for enrichment service validation',
      quality_score: 3.5,
      turn_count: 4,
      tier: 'scenario' as const,
      status: 'pending_review' as const,
      processing_status: 'completed' as const,
      created_by: userId,
      is_active: true,
      enrichment_status: 'not_started',
      // Scaffolding IDs - will be null initially
      persona_id: null,
      emotional_arc_id: null,
      training_topic_id: null,
      template_id: null,
    };

    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .upsert(conversationData, {
        onConflict: 'conversation_id',
      })
      .select()
      .single();

    if (convError) {
      throw new Error(`Failed to create conversation: ${convError.message}`);
    }

    console.log(`   ✅ Conversation created/updated: ${conversationId}`);

    // Step 4: Try to link scaffolding data if available
    console.log('4. Checking for scaffolding data...');
    
    // Look for a persona
    const { data: persona } = await supabase
      .from('personas')
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (persona) {
      console.log(`   ✅ Found persona: ${persona.name}`);
      await supabase
        .from('conversations')
        .update({ persona_id: persona.id })
        .eq('conversation_id', conversationId);
    } else {
      console.log('   ⚠️  No personas found in database');
    }

    // Look for an emotional arc
    const { data: arc } = await supabase
      .from('emotional_arcs')
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (arc) {
      console.log(`   ✅ Found emotional arc: ${arc.name}`);
      await supabase
        .from('conversations')
        .update({ emotional_arc_id: arc.id })
        .eq('conversation_id', conversationId);
    } else {
      console.log('   ⚠️  No emotional arcs found in database');
    }

    // Look for a training topic
    const { data: topic } = await supabase
      .from('training_topics')
      .select('id, name')
      .limit(1)
      .maybeSingle();

    if (topic) {
      console.log(`   ✅ Found training topic: ${topic.name}`);
      await supabase
        .from('conversations')
        .update({ training_topic_id: topic.id })
        .eq('conversation_id', conversationId);
    } else {
      console.log('   ⚠️  No training topics found in database');
    }

    // Look for a template
    const { data: template } = await supabase
      .from('prompt_templates')
      .select('id, template_name')
      .limit(1)
      .maybeSingle();

    if (template) {
      console.log(`   ✅ Found template: ${template.template_name}`);
      await supabase
        .from('conversations')
        .update({ template_id: template.id })
        .eq('conversation_id', conversationId);
    } else {
      console.log('   ⚠️  No templates found in database');
    }

    // Step 5: Create a mock raw response file in storage
    console.log('5. Creating raw response file in storage...');
    
    const minimalJson = {
      conversation_metadata: {
        client_persona: "Marcus Thompson - The Overwhelmed Avoider",
        session_context: "Late night chat after receiving alarming credit card statement",
        conversation_phase: "initial_shame_disclosure",
        expected_outcome: "Reduce shame, normalize debt situation"
      },
      turns: [
        {
          turn_number: 1,
          role: "user",
          content: "I don't even know where to start... I'm so embarrassed about how much debt I have.",
          emotional_context: {
            primary_emotion: "shame",
            secondary_emotion: "overwhelm",
            intensity: 0.85
          }
        },
        {
          turn_number: 2,
          role: "assistant",
          content: "Thank you for sharing that with me, Marcus. I can hear the weight you're carrying, and I want you to know that what you're feeling is completely normal.",
          emotional_context: {
            primary_emotion: "empathy",
            intensity: 0.75
          }
        },
        {
          turn_number: 3,
          role: "user",
          content: "Really? I feel like I'm the only one who's this behind...",
          emotional_context: {
            primary_emotion: "shame",
            secondary_emotion: "isolation",
            intensity: 0.80
          }
        },
        {
          turn_number: 4,
          role: "assistant",
          content: "You're definitely not alone. Many of my clients have felt exactly what you're describing. The fact that you're here, ready to address this, shows real courage.",
          emotional_context: {
            primary_emotion: "encouragement",
            intensity: 0.70
          }
        }
      ]
    };

    const rawPath = `raw/${userId}/${conversationId}.json`;
    const rawContent = JSON.stringify(minimalJson, null, 2);
    const rawBlob = new Blob([rawContent], { type: 'application/json' });

    const { error: uploadError } = await supabase.storage
      .from('conversation-files')
      .upload(rawPath, rawBlob, {
        contentType: 'application/json',
        upsert: true,
      });

    if (uploadError) {
      console.log(`   ⚠️  Could not create raw file: ${uploadError.message}`);
      console.log('   (This is OK - enrichment service will still work with inline JSON)');
    } else {
      console.log(`   ✅ Raw response file created at ${rawPath}`);
      
      // Update conversation with raw_response_path
      await supabase
        .from('conversations')
        .update({
          raw_response_path: rawPath,
          raw_response_size: rawBlob.size,
          raw_stored_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId);
    }

    console.log('\n✅ Setup Complete!\n');
    console.log('Test conversation details:');
    console.log(`  Conversation ID: ${conversationId}`);
    console.log(`  User ID: ${userId}`);
    console.log(`  Quality Score: ${conversationData.quality_score}`);
    console.log(`  Turn Count: ${conversationData.turn_count}`);
    console.log(`\nStorage path will be: ${userId}/${conversationId}/`);
    console.log('\nYou can now run: npx tsx test-enrichment.ts');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setupTestConversation().catch(console.error);

