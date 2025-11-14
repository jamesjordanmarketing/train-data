/**
 * Type Definitions for Conversation Scaffolding Data
 * Matches database schema for personas, emotional_arcs, training_topics
 */

export interface Persona {
  id: string;
  name: string;
  persona_type: string;
  short_name: string;
  description: string;
  archetype_summary?: string;
  demographics: Record<string, any>;
  financial_background?: string;
  financial_situation?: string;
  personality_traits: string[];
  communication_style?: string;
  emotional_baseline: string;
  decision_style?: string;
  typical_questions: string[];
  common_concerns: string[];
  language_patterns: string[];
  domain: string;
  is_active: boolean;
  usage_count: number;
  compatible_arcs: string[];
  complexity_preference?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface EmotionalArc {
  id: string;
  name: string;
  arc_type: string;
  category?: string;
  description: string;
  when_to_use?: string;
  starting_emotion: string;
  starting_intensity_min: number;
  starting_intensity_max: number;
  secondary_starting_emotions: string[];
  midpoint_emotion?: string;
  midpoint_intensity?: number;
  ending_emotion: string;
  ending_intensity_min: number;
  ending_intensity_max: number;
  secondary_ending_emotions: string[];
  turn_structure: Record<string, any>;
  conversation_phases: string[];
  primary_strategy: string;
  response_techniques: string[];
  avoid_tactics: string[];
  key_principles: string[];
  characteristic_phrases: string[];
  opening_templates: string[];
  closing_templates: string[];
  tier_suitability: string[];
  domain: string;
  is_active: boolean;
  usage_count: number;
  typical_turn_count_min?: number;
  typical_turn_count_max?: number;
  complexity_level?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TrainingTopic {
  id: string;
  name: string;
  topic_key: string;
  category?: string;
  description: string;
  typical_question_examples: string[];
  domain: string;
  content_category?: string;
  complexity_level: string;
  requires_numbers: boolean;
  requires_timeframe: boolean;
  requires_personal_context: boolean;
  suitable_personas: string[];
  suitable_arcs: string[];
  suitable_tiers: string[];
  tags: string[];
  related_topics: string[];
  is_active: boolean;
  usage_count: number;
  priority: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
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

