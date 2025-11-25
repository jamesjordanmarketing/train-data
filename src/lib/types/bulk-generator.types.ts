/**
 * Type Definitions for Bulk Conversation Generator
 * Supports multi-select parameters and batch generation
 */

export interface Persona {
  id: string;
  name: string;
  persona_key: string;
  archetype?: string;
  is_active: boolean;
}

export interface EmotionalArc {
  id: string;
  name: string;
  arc_key: string;
  conversation_category: 'core' | 'edge';
  tier?: string;
  arc_strategy?: string;
  is_active: boolean;
}

export interface TrainingTopic {
  id: string;
  name: string;
  topic_key: string;
  category?: string;
  complexity_level?: string;
  is_active: boolean;
}

export interface BatchEstimate {
  conversationCount: number;
  formula: string;
  estimatedTimeMinutes: number;
  estimatedCostUSD: number;
}

export interface BulkGeneratorState {
  category: 'core' | 'edge';
  selectedPersonaIds: string[];
  selectedArcIds: string[];
  selectedTopicIds: string[];
}

export interface ParameterSet {
  templateId: string;
  parameters: {
    persona_id: string;
    emotional_arc_id: string;
    training_topic_id: string;
  };
  tier: 'template' | 'scenario' | 'edge_case';
}

export interface BatchSubmitPayload {
  name: string;
  parameterSets: ParameterSet[];
  concurrentProcessing: number;
  errorHandling: 'stop' | 'continue';
  userId: string;
}

export interface BatchSubmitResponse {
  success: boolean;
  jobId?: string;
  status?: string;
  estimatedCost?: number;
  estimatedTime?: number;
  message?: string;
  error?: string;
}

