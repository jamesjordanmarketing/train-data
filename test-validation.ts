import { getValidationService } from './src/lib/services/conversation-validation-service';

async function testValidation() {
  const service = getValidationService();
  
  // TEST 1: Valid minimal JSON
  console.log('\n=== TEST 1: Valid Minimal JSON ===');
  const validJson = JSON.stringify({
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
      }
    ]
  });
  
  const result1 = await service.validateMinimalJson(validJson, 'test-conv-001');
  console.log('Result:', result1.summary);
  console.log('Is Valid:', result1.isValid);
  console.log('Blockers:', result1.blockers.length);
  console.log('Warnings:', result1.warnings.length);
  
  // TEST 2: Missing required fields
  console.log('\n=== TEST 2: Missing Required Fields ===');
  const invalidJson = JSON.stringify({
    conversation_metadata: {
      client_persona: "Marcus Thompson"
      // Missing session_context and conversation_phase
    },
    turns: [
      {
        turn_number: 1,
        role: "user",
        content: "Help me"
        // Missing emotional_context
      }
    ]
  });
  
  const result2 = await service.validateMinimalJson(invalidJson, 'test-conv-002');
  console.log('Result:', result2.summary);
  console.log('Is Valid:', result2.isValid);
  console.log('Blockers:', result2.blockers.length);
  result2.blockers.forEach(b => console.log(`  - ${b.code}: ${b.message}`));
  
  // TEST 3: Warnings only (non-alternating roles)
  console.log('\n=== TEST 3: Non-blocking Warnings ===');
  const warningJson = JSON.stringify({
    conversation_metadata: {
      client_persona: "Jennifer Lee - The Anxious Planner",
      session_context: "Follow-up session",
      conversation_phase: "strategy_planning"
    },
    turns: [
      {
        turn_number: 1,
        role: "user",
        content: "I have a question about HSAs",
        emotional_context: { primary_emotion: "curious", intensity: 0.5 }
      },
      {
        turn_number: 2,
        role: "user", // Same role twice (warning, not blocker)
        content: "Actually, let me clarify...",
        emotional_context: { primary_emotion: "uncertain", intensity: 0.6 }
      },
      {
        turn_number: 3,
        role: "assistant",
        content: "Of course! Let me explain HSAs.",
        emotional_context: { primary_emotion: "helpful", intensity: 0.7 }
      }
    ]
  });
  
  const result3 = await service.validateMinimalJson(warningJson, 'test-conv-003');
  console.log('Result:', result3.summary);
  console.log('Is Valid:', result3.isValid);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach(w => console.log(`  - ${w.code}: ${w.message}`));
}

testValidation().catch(console.error);

