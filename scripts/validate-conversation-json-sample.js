#!/usr/bin/env node
/**
 * Simple JSON Validation Example
 * 
 * Demonstrates how to validate conversation JSON before upload
 * Usage: node scripts/validate-conversation-json-sample.js
 */

// Sample conversation JSON to validate
const sampleConversation = {
  dataset_metadata: {
    dataset_name: "Sample Financial Planning Conversation",
    version: "1.0.0",
    created_date: new Date().toISOString(),
    vertical: "financial_planning",
    consultant_persona: "Marcus Chen",
    target_use: "LoRA fine-tuning",
    conversation_source: "synthetic",
    quality_tier: "template",
    total_conversations: 1,
    total_turns: 2,
    notes: "Sample conversation for testing"
  },
  consultant_profile: {
    name: "Marcus Chen",
    business: "Financial Planning Practice",
    expertise: "Comprehensive Planning",
    years_experience: 15,
    core_philosophy: {
      approach: "Holistic"
    },
    communication_style: {
      tone: "empathetic",
      techniques: ["active listening"],
      avoid: ["jargon"]
    }
  },
  training_pairs: [
    {
      id: "turn-001",
      conversation_id: "sample-001",
      turn_number: 1,
      system_prompt: "You are a financial planner.",
      current_user_input: "I need help with retirement.",
      emotional_context: {
        detected_emotions: {
          primary: "confusion",
          intensity: 0.7,
          primary_confidence: 0.85
        }
      },
      response_strategy: {
        primary_strategy: "normalize_then_educate",
        tone_selection: "empathetic"
      },
      target_response: "I'm here to help. Let's start with the basics.",
      response_breakdown: {},
      expected_user_response_patterns: {},
      training_metadata: {
        quality_score: 8.5,
        quality_criteria: {
          empathy_score: 9.0,
          clarity_score: 8.5,
          appropriateness_score: 8.8,
          brand_voice_alignment: 9.2
        }
      }
    },
    {
      id: "turn-002",
      conversation_id: "sample-001",
      turn_number: 2,
      system_prompt: "You are a financial planner.",
      current_user_input: "Thank you!",
      emotional_context: {
        detected_emotions: {
          primary: "relief",
          intensity: 0.75,
          primary_confidence: 0.80
        }
      },
      response_strategy: {},
      target_response: "You're welcome!",
      response_breakdown: {},
      expected_user_response_patterns: {},
      training_metadata: {
        quality_score: 8.0,
        quality_criteria: {
          empathy_score: 8.5,
          clarity_score: 8.0,
          appropriateness_score: 8.2,
          brand_voice_alignment: 8.7
        }
      }
    }
  ]
};

// Invalid conversation (for testing validation errors)
const invalidConversation = {
  dataset_metadata: {
    dataset_name: "Invalid Conversation"
    // Missing: version, total_turns (required)
  },
  // Missing: consultant_profile (required)
  training_pairs: [] // Empty (must have at least 1)
};

console.log('========================================');
console.log('CONVERSATION JSON VALIDATION EXAMPLE');
console.log('========================================\n');

console.log('This script demonstrates JSON validation before upload.');
console.log('In production, import the validator from TypeScript:\n');
console.log('  import { validateConversationJSON } from \'@/lib/validators/conversation-schema\';\n');

console.log('========================================');
console.log('EXAMPLE 1: Valid Conversation');
console.log('========================================\n');

console.log('Sample conversation structure:');
console.log('✓ dataset_metadata with required fields');
console.log('✓ consultant_profile');
console.log('✓ training_pairs with 2 turns');
console.log('✓ Quality metrics in training_metadata');
console.log('✓ Emotional context with progression\n');

console.log('Metadata that will be extracted:');
console.log('  - Conversation Name:', sampleConversation.dataset_metadata.dataset_name);
console.log('  - Turn Count:', sampleConversation.dataset_metadata.total_turns);
console.log('  - Tier:', sampleConversation.dataset_metadata.quality_tier);
console.log('  - Category:', sampleConversation.dataset_metadata.vertical);
console.log('  - Quality Score:', sampleConversation.training_pairs[0].training_metadata.quality_score);
console.log('  - Empathy Score:', sampleConversation.training_pairs[0].training_metadata.quality_criteria.empathy_score);
console.log('  - Starting Emotion:', sampleConversation.training_pairs[0].emotional_context.detected_emotions.primary);
console.log('  - Ending Emotion:', sampleConversation.training_pairs[1].emotional_context.detected_emotions.primary);
console.log('  - Emotional Intensity:', 
  `${sampleConversation.training_pairs[0].emotional_context.detected_emotions.intensity} → ` +
  `${sampleConversation.training_pairs[1].emotional_context.detected_emotions.intensity}`
);

console.log('\n✓ This conversation would pass validation\n');

console.log('========================================');
console.log('EXAMPLE 2: Invalid Conversation');
console.log('========================================\n');

console.log('Invalid conversation structure:');
console.log('✗ dataset_metadata missing required fields (version, total_turns)');
console.log('✗ consultant_profile missing entirely');
console.log('✗ training_pairs is empty (must have at least 1)\n');

console.log('Expected validation errors:');
console.log('  - /dataset_metadata: must have required property \'version\'');
console.log('  - /dataset_metadata: must have required property \'total_turns\'');
console.log('  - : must have required property \'consultant_profile\'');
console.log('  - /training_pairs: must NOT have fewer than 1 items\n');

console.log('✗ This conversation would fail validation\n');

console.log('========================================');
console.log('USAGE IN CODE');
console.log('========================================\n');

console.log('TypeScript/JavaScript example:');
console.log(`
import { validateConversationJSON } from '@/lib/validators/conversation-schema';

// Validate before upload
const result = validateConversationJSON(conversationJSON);

if (!result.valid) {
  console.error('Validation failed:');
  result.errors.forEach(error => console.error('  -', error));
  throw new Error('Invalid conversation JSON');
}

// If valid, proceed with upload
const conversation = await conversationStorageService.createConversation({
  conversation_id: 'my-conversation-001',
  file_content: conversationJSON,
  created_by: userId
});
`);

console.log('========================================');
console.log('TO RUN ACTUAL VALIDATION');
console.log('========================================\n');

console.log('1. Compile TypeScript:');
console.log('   npx tsc\n');

console.log('2. Run the test suite:');
console.log('   node scripts/test-conversation-storage-enhancements.js\n');

console.log('3. Or import in your application:');
console.log('   import { validateConversationJSON } from \'@/lib/validators/conversation-schema\';\n');

console.log('========================================');
console.log('SAMPLE JSON FILES');
console.log('========================================\n');

console.log('Valid sample saved to: sample-valid-conversation.json');
console.log('Invalid sample saved to: sample-invalid-conversation.json\n');

// Save samples
const fs = require('fs');
const path = require('path');

try {
  fs.writeFileSync(
    path.join(__dirname, 'sample-valid-conversation.json'),
    JSON.stringify(sampleConversation, null, 2)
  );
  console.log('✓ Created sample-valid-conversation.json');

  fs.writeFileSync(
    path.join(__dirname, 'sample-invalid-conversation.json'),
    JSON.stringify(invalidConversation, null, 2)
  );
  console.log('✓ Created sample-invalid-conversation.json\n');

  console.log('Use these files to test validation in your application.\n');
} catch (error) {
  console.error('✗ Failed to create sample files:', error.message);
}

console.log('========================================\n');
console.log('✓ Validation examples complete!\n');

