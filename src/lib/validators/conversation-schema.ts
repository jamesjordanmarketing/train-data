/**
 * Conversation JSON Schema Validator
 * 
 * Validates conversation JSON files against expected schema before storage
 * Uses Ajv for JSON schema validation
 */

import Ajv from 'ajv';
import type { ConversationJSONFile } from '../types/conversations';

const ajv = new Ajv();

// Define JSON schema for conversation files
const conversationSchema = {
  type: 'object',
  required: ['dataset_metadata', 'consultant_profile', 'training_pairs'],
  properties: {
    dataset_metadata: {
      type: 'object',
      required: ['dataset_name', 'version', 'total_turns'],
      properties: {
        dataset_name: { type: 'string' },
        version: { type: 'string' },
        created_date: { type: 'string' },
        vertical: { type: 'string' },
        consultant_persona: { type: 'string' },
        target_use: { type: 'string' },
        conversation_source: { type: 'string' },
        quality_tier: { type: 'string' },
        total_conversations: { type: 'number' },
        total_turns: { type: 'number' },
        notes: { type: 'string' }
      }
    },
    consultant_profile: {
      type: 'object',
      required: ['name', 'business'],
      properties: {
        name: { type: 'string' },
        business: { type: 'string' },
        expertise: { type: 'string' },
        years_experience: { type: 'number' },
        core_philosophy: { type: 'object' },
        communication_style: {
          type: 'object',
          properties: {
            tone: { type: 'string' },
            techniques: {
              type: 'array',
              items: { type: 'string' }
            },
            avoid: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    },
    training_pairs: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['id', 'conversation_id', 'turn_number', 'target_response'],
        properties: {
          id: { type: 'string' },
          conversation_id: { type: 'string' },
          turn_number: { type: 'number' },
          conversation_metadata: { type: 'object' },
          system_prompt: { type: 'string' },
          conversation_history: { type: 'array' },
          current_user_input: { type: 'string' },
          emotional_context: { type: 'object' },
          response_strategy: { type: 'object' },
          target_response: { type: 'string' },
          response_breakdown: { type: 'object' },
          expected_user_response_patterns: { type: 'object' },
          training_metadata: { type: 'object' }
        }
      }
    }
  }
};

const validate = ajv.compile(conversationSchema);

/**
 * Validate conversation JSON data against schema
 * 
 * @param data - The conversation JSON data to validate
 * @returns Object with validation result and error messages
 */
export function validateConversationJSON(data: any): { valid: boolean; errors: string[] } {
  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors || []).map(err => {
    const path = err.instancePath || 'root';
    const message = err.message || 'validation failed';
    return `${path}: ${message}`;
  });

  return { valid: false, errors };
}

/**
 * Validate and parse conversation JSON (throws on invalid)
 * 
 * @param data - The conversation JSON data to validate
 * @returns Typed ConversationJSONFile object
 * @throws Error if validation fails
 */
export function validateAndParseConversationJSON(data: any): ConversationJSONFile {
  const result = validateConversationJSON(data);
  
  if (!result.valid) {
    throw new Error(`Invalid conversation JSON: ${result.errors.join(', ')}`);
  }
  
  return data as ConversationJSONFile;
}

/**
 * Check if conversation JSON has minimum required quality metrics
 * 
 * @param data - The conversation JSON data
 * @returns Object with validation result and missing fields
 */
export function validateQualityMetrics(data: ConversationJSONFile): {
  valid: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (!data.training_pairs || data.training_pairs.length === 0) {
    missing.push('training_pairs (array is empty)');
    return { valid: false, missing };
  }

  const firstTurn = data.training_pairs[0];

  // Check for training metadata
  if (!firstTurn.training_metadata) {
    missing.push('training_pairs[0].training_metadata');
  } else {
    // Check for quality scores
    if (firstTurn.training_metadata.quality_score === undefined) {
      missing.push('training_metadata.quality_score');
    }
    
    if (!firstTurn.training_metadata.quality_criteria) {
      missing.push('training_metadata.quality_criteria');
    } else {
      const criteria = firstTurn.training_metadata.quality_criteria;
      if (criteria.empathy_score === undefined) missing.push('quality_criteria.empathy_score');
      if (criteria.clarity_score === undefined) missing.push('quality_criteria.clarity_score');
      if (criteria.appropriateness_score === undefined) missing.push('quality_criteria.appropriateness_score');
      if (criteria.brand_voice_alignment === undefined) missing.push('quality_criteria.brand_voice_alignment');
    }
  }

  // Check for emotional context
  if (!firstTurn.emotional_context) {
    missing.push('training_pairs[0].emotional_context');
  } else if (!firstTurn.emotional_context.detected_emotions) {
    missing.push('emotional_context.detected_emotions');
  }

  return {
    valid: missing.length === 0,
    missing
  };
}

