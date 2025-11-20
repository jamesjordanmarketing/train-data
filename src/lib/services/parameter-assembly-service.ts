/**
 * Parameter Assembly Service
 * 
 * Assembles and validates all parameters needed for conversation generation.
 * Orchestrates template selection, compatibility checking, and system prompt construction.
 */

import { ScaffoldingDataService } from './scaffolding-data-service';
import { TemplateSelectionService } from './template-selection-service';
import {
  ConversationParameters,
  AssembledParameters,
  ValidationResult,
  EmotionalArc,
  TrainingTopic
} from '@/lib/types/scaffolding.types';

export class ParameterAssemblyService {
  constructor(
    private scaffoldingService: ScaffoldingDataService,
    private templateSelectionService: TemplateSelectionService
  ) {}

  /**
   * Assemble all parameters needed for conversation generation
   * Main orchestration method that coordinates all assembly steps
   */
  async assembleParameters(input: {
    persona_id: string;
    emotional_arc_id: string;
    training_topic_id: string;
    tier: 'template' | 'scenario' | 'edge_case';
    template_id?: string; // Optional manual override
    chunk_id?: string;
    chunk_context?: string;
    document_id?: string;
    created_by?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<AssembledParameters> {
    // 1. Fetch scaffolding data
    const [persona, emotional_arc, training_topic] = await Promise.all([
      this.scaffoldingService.getPersonaById(input.persona_id),
      this.scaffoldingService.getEmotionalArcById(input.emotional_arc_id),
      this.scaffoldingService.getTrainingTopicById(input.training_topic_id)
    ]);

    // 2. Validate all data exists
    if (!persona) {
      throw new Error(`Persona not found: ${input.persona_id}`);
    }
    if (!emotional_arc) {
      throw new Error(`Emotional arc not found: ${input.emotional_arc_id}`);
    }
    if (!training_topic) {
      throw new Error(`Training topic not found: ${input.training_topic_id}`);
    }

    // 3. Check compatibility
    const compatibility = await this.scaffoldingService.checkCompatibility({
      persona_id: input.persona_id,
      arc_id: input.emotional_arc_id,
      topic_id: input.training_topic_id
    });

    // 4. Select template (auto or manual)
    let template_id = input.template_id;
    if (!template_id) {
      template_id = await this.templateSelectionService.selectTemplate({
        emotional_arc_type: emotional_arc.arc_key,
        tier: input.tier,
        persona_type: persona.persona_key,
        topic_key: training_topic.topic_key
      });
    }

    // 5. Build conversation parameters
    const conversation_params: ConversationParameters = {
      persona,
      emotional_arc,
      training_topic,
      tier: input.tier,
      template_id,
      temperature: input.temperature || this.determineTemperature(emotional_arc, training_topic),
      max_tokens: input.max_tokens || 24576,
      target_turn_count: emotional_arc.typical_turn_count_min || 3,
      chunk_id: input.chunk_id,
      chunk_context: input.chunk_context,
      document_id: input.document_id,
      created_by: input.created_by,
      generation_mode: input.chunk_id ? 'chunk_based' : 'manual'
    };

    // 6. Validate parameters
    const validation = await this.validateParameters(conversation_params);
    if (!validation.is_valid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    // 7. Build template variables
    const template_variables = this.buildTemplateVariables(conversation_params);

    // 8. Construct system prompt
    const system_prompt = this.constructSystemPrompt(conversation_params);

    // 9. Increment usage counters
    await Promise.all([
      this.scaffoldingService.incrementPersonaUsage(input.persona_id),
      this.scaffoldingService.incrementArcUsage(input.emotional_arc_id),
      this.scaffoldingService.incrementTopicUsage(input.training_topic_id)
    ]);

    // 10. Return assembled parameters
    return {
      conversation_params,
      template_variables,
      system_prompt,
      metadata: {
        compatibility_score: compatibility.confidence,
        warnings: [...compatibility.warnings, ...validation.warnings],
        suggestions: [...compatibility.suggestions, ...validation.suggestions]
      }
    };
  }

  /**
   * Validate parameter compatibility and correctness
   */
  async validateParameters(params: ConversationParameters): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate required fields
    if (!params.persona) {
      errors.push('Persona is required');
    }
    if (!params.emotional_arc) {
      errors.push('Emotional arc is required');
    }
    if (!params.training_topic) {
      errors.push('Training topic is required');
    }
    if (!params.tier) {
      errors.push('Tier is required');
    }

    // Validate temperature range
    if (params.temperature !== undefined && (params.temperature < 0 || params.temperature > 1)) {
      errors.push('Temperature must be between 0 and 1');
    }

    // Validate max_tokens
    if (params.max_tokens !== undefined && params.max_tokens < 100) {
      errors.push('max_tokens must be at least 100');
    }

    // Check tier suitability for emotional arc
    // Note: EmotionalArc has a 'tier' field but not 'tier_suitability' array
    // Skipping tier validation for now

    // Check tier suitability for training topic
    // Note: TrainingTopic doesn't have 'suitable_tiers' field
    // Skipping tier validation for now

    // Validate domain consistency
    // Note: Persona, EmotionalArc, and TrainingTopic don't have 'domain' field in current schema
    // Skipping domain validation for now

    // Check if all entities are active
    if (!params.persona.is_active) {
      warnings.push(`Persona "${params.persona.name}" is marked as inactive`);
    }
    if (!params.emotional_arc.is_active) {
      warnings.push(`Emotional arc "${params.emotional_arc.name}" is marked as inactive`);
    }
    if (!params.training_topic.is_active) {
      warnings.push(`Training topic "${params.training_topic.name}" is marked as inactive`);
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Build template variables from scaffolding data
   * Extracts key information from entities for template substitution
   */
  buildTemplateVariables(params: ConversationParameters): Record<string, any> {
    return {
      // Persona variables
      persona_name: params.persona.name,
      persona_type: params.persona.persona_key,
      persona_archetype: params.persona.archetype,
      persona_age: params.persona.age_range || 'Not specified',
      persona_career: params.persona.occupation || 'Not specified',
      persona_income: params.persona.income_range || 'Not specified',
      persona_financial_situation: params.persona.financial_background || params.persona.financial_situation || 'Not specified',
      persona_communication_style: params.persona.communication_style || 'conversational',
      persona_emotional_baseline: params.persona.emotional_baseline,
      persona_traits: params.persona.language_patterns?.join(', ') || 'Not specified',

      // Emotional arc variables
      emotional_arc_name: params.emotional_arc.name,
      emotional_arc_type: params.emotional_arc.arc_key,
      starting_emotion: params.emotional_arc.starting_emotion,
      ending_emotion: params.emotional_arc.ending_emotion,
      midpoint_emotion: 'transitioning', // midpoint_emotion field doesn't exist
      arc_strategy: params.emotional_arc.arc_strategy, // was primary_strategy
      arc_key_principles: params.emotional_arc.key_principles.join(', '),
      arc_phases: '', // conversation_phases field doesn't exist

      // Topic variables
      topic_name: params.training_topic.name,
      topic_key: params.training_topic.topic_key,
      topic_description: params.training_topic.description,
      topic_category: params.training_topic.category || 'general', // content_category doesn't exist
      topic_complexity: params.training_topic.complexity_level,
      typical_questions: params.training_topic.typical_question_examples.join('\n- '),

      // Generation configuration
      tier: params.tier,
      target_turns: params.target_turn_count,
      temperature: params.temperature,

      // Additional context
      chunk_context: params.chunk_context || '',
      has_chunk_context: Boolean(params.chunk_context)
    };
  }

  /**
   * Construct system prompt from scaffolding data
   * Builds Elena Morales system prompt with all 5 core principles
   */
  constructSystemPrompt(params: ConversationParameters): string {
    // Note: opening_templates and closing_templates don't exist in EmotionalArc schema
    const openingTemplates = '';
    const closingTemplates = '';

    return `You are an emotionally intelligent financial planning chatbot representing Elena Morales, CFP of Pathways Financial Planning.

Your core principles:
1. Money is emotional - Acknowledge feelings before facts in EVERY response
2. Judgment-free space - Normalize confusion/shame explicitly
3. Education-first - Teach "why" not just "what"
4. Progress over perfection - Celebrate existing understanding
5. Values-aligned - Personal context over generic rules

Current conversation context:
- Client Persona: ${params.persona.name}
- Emotional Baseline: ${params.persona.emotional_baseline}
- Emotional Journey: ${params.emotional_arc.name} (${params.emotional_arc.starting_emotion} → ${params.emotional_arc.ending_emotion})
- Topic: ${params.training_topic.name}
- Complexity Level: ${params.training_topic.complexity_level}
- Target Turns: ${params.target_turn_count || '3-5'}

Persona background:
- Name: ${params.persona.name}
- Archetype: ${params.persona.archetype}
- Emotional Baseline: ${params.persona.emotional_baseline}

Communication patterns for this arc:
${params.emotional_arc.characteristic_phrases.slice(0, 5).map(p => '- ' + p).join('\n')}

Response techniques to use:
${params.emotional_arc.response_techniques.slice(0, 5).map(t => '- ' + t).join('\n')}

Tactics to avoid:
${params.emotional_arc.avoid_tactics.slice(0, 5).map(t => '- ' + t).join('\n')}

Client communication style: ${params.persona.communication_style || 'conversational'}

Typical client concerns:
${params.persona.common_concerns.slice(0, 5).map(c => '- ' + c).join('\n')}${openingTemplates}${closingTemplates}

${params.chunk_context ? `\nAdditional context from knowledge base:\n${params.chunk_context}\n` : ''}
Your goal: Guide this client from ${params.emotional_arc.starting_emotion} to ${params.emotional_arc.ending_emotion} through ${params.target_turn_count || '3-5'} conversational turns, maintaining Elena's voice and methodology throughout.`;
  }

  /**
   * Determine optimal temperature based on arc and topic characteristics
   */
  private determineTemperature(arc: EmotionalArc, topic: TrainingTopic): number {
    // Note: EmotionalArc doesn't have 'category' field in current schema
    // Using complexity_level from topic if available
    
    if (topic.complexity_level === 'advanced') return 0.70;
    if (topic.complexity_level === 'beginner') return 0.65;

    // Default moderate temperature
    return 0.70;
  }
}

