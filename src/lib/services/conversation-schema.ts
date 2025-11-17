/**
 * Conversation JSON Schema for Claude Structured Outputs
 * 
 * This schema enforces valid JSON structure at generation time.
 * Based on: C:\Users\james\Master\BrightHub\BRun\train-data\pmc\context-ai\pmct\training-data-seeds\c-alpha-build_v3.4_emotional-dataset-JSON-format_v3.json
 * 
 * Reference: https://docs.anthropic.com/en/docs/build-with-claude/structured-outputs
 */

export const CONVERSATION_JSON_SCHEMA = {
  type: "object",
  properties: {
    conversation_metadata: {
      type: "object",
      properties: {
        client_persona: { 
          type: "string",
          description: "Name and archetype of the user in the conversation"
        },
        session_context: { 
          type: "string",
          description: "When and why this interaction is happening"
        },
        conversation_phase: { 
          type: "string",
          description: "Stage of conversation (e.g., initial_opportunity_exploration)"
        },
        expected_outcome: { 
          type: "string",
          description: "What this conversation should accomplish"
        }
      },
      required: ["client_persona", "session_context", "conversation_phase"],
      additionalProperties: false
    },
    turns: {
      type: "array",
      description: "Array of conversation turns between user and assistant",
      items: {
        type: "object",
        properties: {
          turn_number: { 
            type: "integer",
            description: "Position in conversation (1-based)"
          },
          role: { 
            type: "string",
            enum: ["user", "assistant"],
            description: "Who is speaking in this turn"
          },
          content: { 
            type: "string",
            description: "The actual message content"
          },
          emotional_context: {
            type: "object",
            description: "Emotional state and progression analysis",
            properties: {
              primary_emotion: { 
                type: "string",
                description: "Most prominent emotion (e.g., anxiety, hope, fear)"
              },
              secondary_emotion: { 
                type: "string",
                description: "Second emotion if present"
              },
              intensity: { 
                type: "number",
                description: "Emotional intensity from 0 (none) to 1 (extreme). Must be between 0.0 and 1.0."
              }
            },
            required: ["primary_emotion", "intensity"],
            additionalProperties: false
          }
        },
        required: ["turn_number", "role", "content", "emotional_context"],
        additionalProperties: false
      }
    }
  },
  required: ["conversation_metadata", "turns"],
  additionalProperties: false
} as const;

/**
 * TypeScript type inferred from schema for type safety
 */
export type ConversationJSON = {
  conversation_metadata: {
    client_persona: string;
    session_context: string;
    conversation_phase: string;
    expected_outcome?: string;
  };
  turns: Array<{
    turn_number: number;
    role: 'user' | 'assistant';
    content: string;
    emotional_context: {
      primary_emotion: string;
      secondary_emotion?: string;
      intensity: number;
    };
  }>;
};

