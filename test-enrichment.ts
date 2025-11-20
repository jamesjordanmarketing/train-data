// Load environment variables from .env.local
require('./load-env.js');

import { getEnrichmentService } from './src/lib/services/conversation-enrichment-service';
import { getConversationStorageService } from './src/lib/services/conversation-storage-service';

async function testEnrichment() {
  const enrichmentService = getEnrichmentService();
  const storageService = getConversationStorageService();
  
  // TEST: Enrich a minimal conversation
  console.log('\n=== TEST: Enrichment Service ===');
  
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
        role: "user" as const,
        content: "I don't even know where to start... I'm so embarrassed about how much debt I have.",
        emotional_context: {
          primary_emotion: "shame",
          secondary_emotion: "overwhelm",
          intensity: 0.85
        }
      },
      {
        turn_number: 2,
        role: "assistant" as const,
        content: "Thank you for sharing that with me, Marcus. I can hear the weight you're carrying, and I want you to know that what you're feeling is completely normal.",
        emotional_context: {
          primary_emotion: "empathy",
          intensity: 0.75
        }
      },
      {
        turn_number: 3,
        role: "user" as const,
        content: "Really? I feel like I'm the only one who's this behind...",
        emotional_context: {
          primary_emotion: "shame",
          secondary_emotion: "isolation",
          intensity: 0.80
        }
      },
      {
        turn_number: 4,
        role: "assistant" as const,
        content: "You're definitely not alone. Many of my clients have felt exactly what you're describing. The fact that you're here, ready to address this, shows real courage.",
        emotional_context: {
          primary_emotion: "encouragement",
          intensity: 0.70
        }
      }
    ]
  };
  
  try {
    // Enrich the conversation
    const conversationId = 'test-conv-001';
    
    // Get the conversation to find the user ID
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: conv } = await supabase
      .from('conversations')
      .select('created_by')
      .eq('conversation_id', conversationId)
      .single();
    
    const userId = conv?.created_by || '00000000-0000-0000-0000-000000000001';
    console.log(`Using user ID: ${userId}`);
    
    const enriched = await enrichmentService.enrichConversation(conversationId, minimalJson);
    
    console.log('\n✅ Enrichment Results:');
    console.log(`Dataset Name: ${enriched.dataset_metadata.dataset_name}`);
    console.log(`Version: ${enriched.dataset_metadata.version}`);
    console.log(`Quality Tier: ${enriched.dataset_metadata.quality_tier}`);
    console.log(`Total Turns: ${enriched.dataset_metadata.total_turns}`);
    console.log(`\nConsultant: ${enriched.consultant_profile.name}`);
    console.log(`Business: ${enriched.consultant_profile.business}`);
    console.log(`\nTraining Pairs: ${enriched.training_pairs.length}`);
    
    // Check first training pair
    const firstPair = enriched.training_pairs[0];
    console.log(`\nFirst Training Pair:`);
    console.log(`  ID: ${firstPair.id}`);
    console.log(`  Turn: ${firstPair.turn_number}`);
    console.log(`  Current User Input: ${firstPair.current_user_input.substring(0, 50)}...`);
    console.log(`  Valence: ${firstPair.emotional_context.detected_emotions.valence}`);
    console.log(`  Difficulty: ${firstPair.training_metadata.difficulty_level}`);
    console.log(`  Quality Score: ${firstPair.training_metadata.quality_score}`);
    console.log(`  Quality Breakdown:`);
    console.log(`    Empathy: ${firstPair.training_metadata.quality_criteria.empathy_score}`);
    console.log(`    Clarity: ${firstPair.training_metadata.quality_criteria.clarity_score}`);
    console.log(`    Appropriateness: ${firstPair.training_metadata.quality_criteria.appropriateness_score}`);
    console.log(`    Brand Voice: ${firstPair.training_metadata.quality_criteria.brand_voice_alignment}`);
    
    // Store enriched conversation
    console.log('\n=== TEST: Storage Integration ===');
    const storeResult = await storageService.storeEnrichedConversation(
      conversationId,
      userId,
      enriched
    );
    
    if (storeResult.success) {
      console.log(`✅ Enriched conversation stored:`);
      console.log(`  Path: ${storeResult.enrichedPath}`);
      console.log(`  Size: ${storeResult.enrichedSize} bytes`);
    } else {
      console.error(`❌ Storage failed: ${storeResult.error}`);
    }
    
  } catch (error) {
    console.error('❌ Enrichment test failed:', error);
  }
}

testEnrichment().catch(console.error);

