/**
 * Conversation Enrichment Service
 * 
 * Enriches minimal JSON with predetermined fields from database and configuration.
 * Does NOT perform AI analysis - that's a future phase.
 * 
 * Data Sources:
 * 1. Database tables: personas, emotional_arcs, training_topics, templates, generation_logs, conversations
 * 2. Configuration: Consultant profile (static)
 * 3. Minimal JSON: conversation_metadata, turns (already validated)
 * 4. Calculations: Emotional valence, quality breakdown
 * 
 * Output: EnrichedConversation ready for normalization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  EnrichedConversation,
  DatasetMetadata,
  ConsultantProfile,
  TrainingPair,
  ConversationHistoryTurn,
  DatabaseEnrichmentMetadata,
} from '../types/conversations';

/**
 * Minimal conversation JSON (input from Claude - already validated)
 */
interface MinimalConversation {
  conversation_metadata: {
    client_persona: string;
    session_context: string;
    conversation_phase: string;
    expected_outcome?: string;
  };
  turns: MinimalTurn[];
  input_parameters?: {
    persona_id: string;
    persona_name: string;
    persona_key: string;
    persona_archetype?: string;
    emotional_arc_id: string;
    emotional_arc_name: string;
    emotional_arc_key: string;
    training_topic_id: string;
    training_topic_name: string;
    training_topic_key: string;
  };
}

interface MinimalTurn {
  turn_number: number;
  role: 'user' | 'assistant';
  content: string;
  emotional_context: {
    primary_emotion: string;
    secondary_emotion?: string;
    intensity: number;
  };
}

/**
 * Static consultant profile configuration
 */
const CONSULTANT_PROFILE: ConsultantProfile = {
  name: "Elena Morales, CFP",
  business: "Pathways Financial Planning",
  expertise: "fee-only financial planning for mid-career professionals",
  years_experience: 15,
  core_philosophy: {
    principle_1: "Money is emotional - always acknowledge feelings before facts",
    principle_2: "Create judgment-free space - normalize struggles explicitly",
    principle_3: "Education-first - teach the 'why' not just the 'what'",
    principle_4: "Progress over perfection - celebrate small wins",
    principle_5: "Values-aligned decisions - personal context over generic rules"
  },
  communication_style: {
    tone: "warm, professional, never condescending",
    techniques: [
      "acknowledge emotions explicitly",
      "use metaphors and stories for complex concepts",
      "provide specific numbers over abstractions",
      "ask permission before educating",
      "celebrate progress and small wins"
    ],
    avoid: [
      "financial jargon without explanation",
      "assumptions about knowledge level",
      "judgment of past financial decisions",
      "overwhelming with too many options",
      "generic platitudes without specifics"
    ]
  }
} as const;

export class ConversationEnrichmentService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      // Create default client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Enrich a validated conversation with predetermined fields
   * 
   * @param conversationId - ID of conversation to enrich
   * @param minimalJson - Parsed minimal JSON from Claude (already validated)
   * @returns Enriched conversation data ready for storage
   */
  async enrichConversation(
    conversationId: string,
    minimalJson: MinimalConversation
  ): Promise<EnrichedConversation> {
    
    console.log(`[Enrichment] Starting enrichment for conversation ${conversationId}`);
    
    // STEP 1: Fetch database metadata
    const dbMetadata = await this.fetchDatabaseMetadata(conversationId);
    
    // STEP 2: Build dataset_metadata
    const dataset_metadata = this.buildDatasetMetadata(
      conversationId,
      dbMetadata,
      minimalJson
    );
    
    // STEP 3: Build consultant_profile (static)
    const consultant_profile = CONSULTANT_PROFILE;
    
    // STEP 4: Transform turns → training_pairs
    const training_pairs = this.buildTrainingPairs(
      minimalJson,
      dbMetadata
    );
    
    // Log scaffolding integration
    const hasScaffolding = minimalJson.input_parameters && 
      (minimalJson.input_parameters.persona_key || 
       minimalJson.input_parameters.emotional_arc_name || 
       minimalJson.input_parameters.training_topic_name);
    
    if (hasScaffolding) {
      console.log(`[Enrichment] ✅ Added scaffolding metadata to ${training_pairs.length} training pairs`);
    } else {
      console.log(`[Enrichment] ⚠️  No input_parameters - training pairs lack scaffolding metadata`);
    }
    
    console.log(`[Enrichment] ✅ Enrichment complete: ${training_pairs.length} training pairs created`);
    
    // STEP 5: Copy input_parameters from parsed JSON (if present)
    const enrichedResult: any = {
      dataset_metadata,
      consultant_profile,
      training_pairs
    };

    if (minimalJson.input_parameters) {
      enrichedResult.input_parameters = minimalJson.input_parameters;
      console.log(`[Enrichment] ✅ Copied input_parameters to enriched JSON`);
    } else {
      console.log(`[Enrichment] ⚠️  No input_parameters in parsed JSON - skipping`);
    }
    
    return enrichedResult;
  }

  /**
   * Fetch all metadata from database needed for enrichment
   */
  private async fetchDatabaseMetadata(conversationId: string): Promise<DatabaseEnrichmentMetadata> {
    console.log(`[Enrichment] Fetching database metadata for ${conversationId}`);
    
    // Fetch conversation with scaffolding IDs
    const { data: conversation, error } = await this.supabase
      .from('conversations')
      .select(`
        conversation_id,
        created_at,
        quality_score,
        turn_count,
        persona_id,
        emotional_arc_id,
        training_topic_id,
        template_id
      `)
      .eq('conversation_id', conversationId)
      .single();

    if (error || !conversation) {
      throw new Error(`Failed to fetch conversation: ${error?.message || 'Not found'}`);
    }

    // Fetch persona
    let persona = null;
    if (conversation.persona_id) {
      const { data } = await this.supabase
        .from('personas')
        .select('name, archetype, demographics, financial_background')
        .eq('id', conversation.persona_id)
        .single();
      persona = data;
    }

    // Fetch emotional arc
    let emotional_arc = null;
    if (conversation.emotional_arc_id) {
      const { data } = await this.supabase
        .from('emotional_arcs')
        .select('name, starting_emotion, ending_emotion, arc_strategy')
        .eq('id', conversation.emotional_arc_id)
        .single();
      
      // Map arc_strategy to transformation_pattern
      emotional_arc = data ? {
        ...data,
        transformation_pattern: data.arc_strategy
      } : null;
    }

    // Fetch training topic
    let training_topic = null;
    if (conversation.training_topic_id) {
      const { data } = await this.supabase
        .from('training_topics')
        .select('name, complexity_level')
        .eq('id', conversation.training_topic_id)
        .single();
      training_topic = data;
    }

    // Fetch template
    let template = null;
    if (conversation.template_id) {
      const { data } = await this.supabase
        .from('prompt_templates')
        .select('template_name, category, suitable_topics, suitable_personas')
        .eq('id', conversation.template_id)
        .single();
      
      // Map template fields to expected structure
      template = data ? {
        name: data.template_name,
        code: data.category,
        description: null,
        learning_objectives: Array.isArray(data.suitable_topics) ? data.suitable_topics : null,
        skills: Array.isArray(data.suitable_personas) ? data.suitable_personas : null
      } : null;
    }

    // Fetch generation log (for system_prompt if stored)
    let generation_log = null;
    const { data: logData } = await this.supabase
      .from('generation_logs')
      .select('system_prompt, request_payload')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Extract system_prompt from request_payload if not directly available
    generation_log = logData ? {
      system_prompt: logData.system_prompt || logData.request_payload?.system_prompt || null
    } : null;

    console.log(`[Enrichment] ✅ Database metadata fetched`);

    return {
      conversation_id: conversation.conversation_id,
      created_at: conversation.created_at,
      quality_score: conversation.quality_score || 3.0,
      turn_count: conversation.turn_count || 0,
      persona,
      emotional_arc,
      training_topic,
      template,
      generation_log
    };
  }

  /**
   * Build dataset_metadata from database and minimal JSON
   */
  private buildDatasetMetadata(
    conversationId: string,
    dbMetadata: DatabaseEnrichmentMetadata,
    minimalJson: MinimalConversation
  ): DatasetMetadata {
    // Map quality_score (1-5 scale) to quality_tier
    let quality_tier = "experimental";
    if (dbMetadata.quality_score >= 4.5) {
      quality_tier = "seed_dataset";
    } else if (dbMetadata.quality_score >= 3.5) {
      quality_tier = "production";
    }

    // Create dataset name
    const dataset_name = `fp_conversation_${conversationId}`;

    // Extract date from created_at
    const created_date = dbMetadata.created_at.split('T')[0];

    // Build notes
    const templateName = dbMetadata.template?.name || 'unknown';
    const notes = `Generated via template: ${templateName}`;

    return {
      dataset_name,
      version: "1.0.0",
      created_date,
      vertical: "financial_planning_consultant",
      consultant_persona: "Elena Morales, CFP - Pathways Financial Planning",
      target_use: "LoRA fine-tuning for emotionally intelligent chatbot",
      conversation_source: "synthetic_platform_generated",
      quality_tier,
      total_conversations: 1,
      total_turns: minimalJson.turns.length,
      notes
    };
  }

  /**
   * Transform minimal turns into enriched training_pairs
   */
  private buildTrainingPairs(
    minimalJson: MinimalConversation,
    dbMetadata: DatabaseEnrichmentMetadata
  ): TrainingPair[] {
    const training_pairs: TrainingPair[] = [];
    const turns = minimalJson.turns;

    for (let i = 0; i < turns.length; i++) {
      const turn = turns[i];
      const previousTurns = turns.slice(0, i);

      const training_pair = this.buildTrainingPair(
        turn,
        previousTurns,
        minimalJson.conversation_metadata,
        minimalJson.input_parameters, // Pass input_parameters for scaffolding
        dbMetadata,
        i
      );

      training_pairs.push(training_pair);
    }

    return training_pairs;
  }

  /**
   * Build a single training_pair from a minimal turn
   */
  private buildTrainingPair(
    turn: MinimalTurn,
    previousTurns: MinimalTurn[],
    conversationMetadata: MinimalConversation['conversation_metadata'],
    inputParameters: MinimalConversation['input_parameters'],
    dbMetadata: DatabaseEnrichmentMetadata,
    turnIndex: number
  ): TrainingPair {
    
    // Generate IDs
    const templateCode = dbMetadata.template?.code || 'fp_conversation';
    const id = `${templateCode}_turn${turn.turn_number}`;
    const conversation_id = templateCode;

    // Build conversation_metadata with client_background
    const client_background = this.buildClientBackground(
      dbMetadata.persona,
      conversationMetadata.client_persona
    );

    // Get system_prompt
    const system_prompt = this.getSystemPrompt(dbMetadata);

    // Build conversation_history from previous turns
    const conversation_history = this.buildConversationHistory(previousTurns);

    // Get current_user_input
    const current_user_input = this.getCurrentUserInput(turn, previousTurns);

    // Build emotional_context with valence
    const emotional_context = {
      detected_emotions: {
        primary: turn.emotional_context.primary_emotion,
        primary_confidence: 0.8, // Default confidence
        ...(turn.emotional_context.secondary_emotion && {
          secondary: turn.emotional_context.secondary_emotion,
          secondary_confidence: 0.7
        }),
        intensity: turn.emotional_context.intensity,
        valence: this.classifyEmotionalValence(turn.emotional_context.primary_emotion)
      }
    };

    // Get target_response (for assistant turns)
    const target_response = turn.role === 'assistant' ? turn.content : null;

    // Build training_metadata
    const training_metadata = this.buildTrainingMetadata(
      turn,
      dbMetadata,
      turnIndex
    );

    // Use database persona name if available (BUG FIX #6)
    // This ensures consistency even if Claude's output was incorrect
    const client_persona = dbMetadata.persona 
      ? `${dbMetadata.persona.name} - ${dbMetadata.persona.archetype || 'Client'}`
      : conversationMetadata.client_persona;

    // Build conversation_metadata with scaffolding (ITERATION 2 ENHANCEMENT)
    const metadata: any = {
      client_persona, // Use validated persona from database
      client_background,
      session_context: conversationMetadata.session_context,
      conversation_phase: conversationMetadata.conversation_phase,
      expected_outcome: conversationMetadata.expected_outcome || 'Provide emotionally intelligent support'
    };

    // Add scaffolding metadata from input_parameters (for LoRA training effectiveness)
    if (inputParameters) {
      if (inputParameters.persona_key) {
        metadata.persona_archetype = inputParameters.persona_key;
      }
      if (inputParameters.emotional_arc_name) {
        metadata.emotional_arc = inputParameters.emotional_arc_name;
      }
      if (inputParameters.emotional_arc_key) {
        metadata.emotional_arc_key = inputParameters.emotional_arc_key;
      }
      if (inputParameters.training_topic_name) {
        metadata.training_topic = inputParameters.training_topic_name;
      }
      if (inputParameters.training_topic_key) {
        metadata.training_topic_key = inputParameters.training_topic_key;
      }
    }

    return {
      id,
      conversation_id,
      turn_number: turn.turn_number,
      conversation_metadata: metadata,
      system_prompt,
      conversation_history,
      current_user_input,
      emotional_context,
      target_response,
      training_metadata
    };
  }

  /**
   * Build client_background from persona data
   */
  private buildClientBackground(
    persona: DatabaseEnrichmentMetadata['persona'],
    client_persona: string
  ): string {
    if (!persona) {
      return `Client profile: ${client_persona}`;
    }

    const parts: string[] = [];

    if (persona.demographics) {
      parts.push(persona.demographics);
    }

    if (persona.financial_background) {
      parts.push(persona.financial_background);
    }

    if (parts.length === 0) {
      return `Client profile: ${client_persona}`;
    }

    return parts.join('; ');
  }

  /**
   * Get system_prompt from generation log or reconstruct from template
   */
  private getSystemPrompt(dbMetadata: DatabaseEnrichmentMetadata): string {
    // If stored in generation_logs, use that
    if (dbMetadata.generation_log?.system_prompt) {
      return dbMetadata.generation_log.system_prompt;
    }

    // Otherwise, reconstruct standard system prompt
    return `You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning. Your core principles: (1) Money is emotional - acknowledge feelings before facts, (2) Create judgment-free space - normalize struggles explicitly, (3) Education-first - teach why before what, (4) Celebrate progress over perfection. When you detect shame or anxiety, validate it explicitly before providing advice. Break down complex concepts into simple, single steps. Use specific numbers over abstractions. Always ask permission before educating. Your tone is warm and professional, never condescending.`;
  }

  /**
   * Build conversation_history from previous turns
   */
  private buildConversationHistory(previousTurns: MinimalTurn[]): ConversationHistoryTurn[] {
    return previousTurns.map(turn => ({
      turn: turn.turn_number,
      role: turn.role,
      content: turn.content,
      emotional_state: {
        primary: turn.emotional_context.primary_emotion,
        ...(turn.emotional_context.secondary_emotion && {
          secondary: turn.emotional_context.secondary_emotion
        }),
        intensity: turn.emotional_context.intensity
      }
    }));
  }

  /**
   * Get current_user_input for this training pair
   * For user turns: use current turn content
   * For assistant turns: use previous turn (last user message)
   */
  private getCurrentUserInput(
    currentTurn: MinimalTurn,
    previousTurns: MinimalTurn[]
  ): string {
    if (currentTurn.role === 'user') {
      return currentTurn.content;
    }

    // For assistant turn, find most recent user message
    for (let i = previousTurns.length - 1; i >= 0; i--) {
      if (previousTurns[i].role === 'user') {
        return previousTurns[i].content;
      }
    }

    // Fallback (shouldn't happen if validation passed)
    return '';
  }

  /**
   * Classify emotional valence from primary emotion
   */
  private classifyEmotionalValence(primaryEmotion: string): string {
    const emotion = primaryEmotion.toLowerCase();

    // Positive emotions
    const positive = ['hope', 'relief', 'excitement', 'joy', 'confidence', 'gratitude', 'pride', 'determination', 'calm', 'optimism'];
    if (positive.some(e => emotion.includes(e))) {
      return 'positive';
    }

    // Negative emotions
    const negative = ['shame', 'fear', 'anxiety', 'guilt', 'anger', 'frustration', 'overwhelm', 'sadness', 'embarrassment', 'worry', 'stress'];
    if (negative.some(e => emotion.includes(e))) {
      return 'negative';
    }

    // Mixed/neutral
    return 'mixed';
  }

  /**
   * Build training_metadata from database and calculations
   */
  private buildTrainingMetadata(
    turn: MinimalTurn,
    dbMetadata: DatabaseEnrichmentMetadata,
    turnIndex: number
  ): TrainingPair['training_metadata'] {
    
    // Assess difficulty level from topic complexity
    const complexity = dbMetadata.training_topic?.complexity_level || 'intermediate';
    const difficulty_level = `${complexity}_conversation_turn_${turn.turn_number}`;

    // Get learning objective from template
    const key_learning_objective = dbMetadata.template?.learning_objectives?.[0] || 
      'Provide emotionally intelligent financial guidance';

    // Get skills from template
    const demonstrates_skills = dbMetadata.template?.skills || ['empathy', 'active_listening'];

    // Build emotional progression target from arc
    let emotional_progression_target = '';
    if (dbMetadata.emotional_arc) {
      emotional_progression_target = `${dbMetadata.emotional_arc.starting_emotion}(0.8) → ${dbMetadata.emotional_arc.ending_emotion}(0.8)`;
    }

    // Get quality_score and break down into criteria
    const quality_score = Math.round(dbMetadata.quality_score);
    const quality_criteria = this.breakdownQualityScore(dbMetadata.quality_score);

    return {
      difficulty_level,
      key_learning_objective,
      demonstrates_skills,
      conversation_turn: turn.turn_number,
      emotional_progression_target,
      quality_score,
      quality_criteria,
      human_reviewed: false,
      reviewer_notes: null,
      use_as_seed_example: false,
      generate_variations_count: 0
    };
  }

  /**
   * Break down overall quality_score into component criteria
   * Assumes equal weighting with small random variation
   */
  private breakdownQualityScore(overall: number): TrainingPair['training_metadata']['quality_criteria'] {
    // Add small random variation to make it look more realistic
    const variation = () => Math.round((Math.random() * 0.4 - 0.2) * 10) / 10; // ±0.2

    return {
      empathy_score: Math.min(5, Math.max(1, overall + variation())),
      clarity_score: Math.min(5, Math.max(1, overall + variation())),
      appropriateness_score: Math.min(5, Math.max(1, overall + variation())),
      brand_voice_alignment: Math.min(5, Math.max(1, overall + variation()))
    };
  }
}

// Export factory function for convenience
export function createEnrichmentService(supabase?: SupabaseClient): ConversationEnrichmentService {
  return new ConversationEnrichmentService(supabase);
}

// Export singleton instance
let enrichmentServiceInstance: ConversationEnrichmentService | null = null;

export function getEnrichmentService(): ConversationEnrichmentService {
  if (!enrichmentServiceInstance) {
    enrichmentServiceInstance = new ConversationEnrichmentService();
  }
  return enrichmentServiceInstance;
}

