/**
 * Type Definitions for Conversation Scaffolding Data
 * Matches database schema for personas, emotional_arcs, training_topics
 */

export interface Persona {
  id: string;
  persona_key: string;
  name: string;
  archetype: string;
  age_range?: string;
  occupation?: string;
  income_range?: string;
  demographics: Record<string, any>;
  financial_background?: string;
  financial_situation?: string;
  communication_style?: string;
  emotional_baseline: string;
  typical_questions: string[];
  common_concerns: string[];
  language_patterns: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmotionalArc {
  id: string;
  arc_key: string;
  name: string;
  starting_emotion: string;
  starting_intensity_min: number;
  starting_intensity_max: number;
  ending_emotion: string;
  ending_intensity_min: number;
  ending_intensity_max: number;
  arc_strategy: string;
  key_principles: string[];
  characteristic_phrases: string[];
  response_techniques: string[];
  avoid_tactics: string[];
  typical_turn_count_min?: number;
  typical_turn_count_max?: number;
  complexity_baseline?: number;
  tier?: string;
  suitable_personas: string[];
  suitable_topics: string[];
  example_conversation_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TrainingTopic {
  id: string;
  topic_key: string;
  name: string;
  category?: string;
  description: string;
  complexity_level: string;
  typical_question_examples: string[];
  key_concepts: string[];
  suitable_personas: string[];
  suitable_emotional_arcs: string[];
  requires_specialist: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompatibilityResult {
  is_compatible: boolean;
  warnings: string[];
  suggestions: string[];
  confidence: number; // 0-1
}

export interface ConversationParameters {
  persona: Persona;
  emotional_arc: EmotionalArc;
  training_topic: TrainingTopic;
  tier: 'template' | 'scenario' | 'edge_case';
  template_id?: string;
  temperature?: number;
  max_tokens?: number;
  target_turn_count?: number;
  chunk_id?: string;
  chunk_context?: string;
  document_id?: string;
  created_by?: string;
  generation_mode: 'manual' | 'chunk_based' | 'batch';
}

export interface AssembledParameters {
  conversation_params: ConversationParameters;
  template_variables: Record<string, any>;
  system_prompt: string;
  metadata: {
    compatibility_score: number;
    warnings: string[];
    suggestions: string[];
  };
}

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface TemplateSelectionCriteria {
  emotional_arc_type: string;
  tier: 'template' | 'scenario' | 'edge_case';
  persona_type?: string;
  topic_key?: string;
}

export interface TemplateSelectionResult {
  template_id: string;
  template_name: string;
  confidence_score: number;
  rationale: string;
  alternatives: Array<{
    template_id: string;
    template_name: string;
    confidence_score: number;
  }>;
}

