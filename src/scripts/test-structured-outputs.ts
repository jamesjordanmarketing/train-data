/**
 * Test Script for Claude Structured Outputs
 * 
 * Validates that structured outputs are working correctly and producing valid JSON
 * that conforms to the conversation schema.
 * 
 * Usage:
 *   npx tsx src/scripts/test-structured-outputs.ts
 */

import { ClaudeAPIClient } from '../lib/services/claude-api-client';

async function testStructuredOutputs() {
  const client = new ClaudeAPIClient();
  
  console.log('Testing Claude Structured Outputs...\n');
  console.log('='.repeat(60));
  
  // Test with structured outputs enabled
  const testPrompt = `Generate a simple test conversation between a user asking about their budget and a financial advisor. Use 2 turns total. Return as JSON matching the schema.

  The conversation should follow this format:
  - conversation_metadata with client_persona, session_context, conversation_phase
  - turns array with turn_number, role, content, and emotional_context
  
  Keep it brief and realistic.`;
  
  try {
    console.log('\n📝 Test Prompt:');
    console.log(testPrompt.substring(0, 100) + '...\n');
    
    console.log('🚀 Calling Claude API with structured outputs enabled...\n');
    
    const startTime = Date.now();
    const response = await client.generateConversation(testPrompt, {
      useStructuredOutputs: true,
      maxTokens: 1000
    });
    const duration = Date.now() - startTime;
    
    console.log('✅ API call succeeded');
    console.log(`   Response length: ${response.content.length} chars`);
    console.log(`   Input tokens: ${response.usage.input_tokens}`);
    console.log(`   Output tokens: ${response.usage.output_tokens}`);
    console.log(`   Cost: $${response.cost.toFixed(4)}`);
    console.log(`   Duration: ${duration}ms\n`);
    
    console.log('='.repeat(60));
    console.log('\n🔍 Validating JSON structure...\n');
    
    // Try to parse response
    let parsed: any;
    try {
      parsed = JSON.parse(response.content);
      console.log('✅ JSON parsed successfully');
    } catch (parseError) {
      console.error('❌ JSON parse failed:', parseError);
      console.log('\nRaw response (first 500 chars):');
      console.log(response.content.substring(0, 500));
      process.exit(1);
    }
    
    // Validate schema compliance
    console.log('\n📋 Checking required fields...\n');
    
    const validations = [
      {
        name: 'conversation_metadata exists',
        check: () => !!parsed.conversation_metadata,
        value: () => 'present'
      },
      {
        name: 'conversation_metadata.client_persona',
        check: () => typeof parsed.conversation_metadata?.client_persona === 'string',
        value: () => parsed.conversation_metadata?.client_persona
      },
      {
        name: 'conversation_metadata.session_context',
        check: () => typeof parsed.conversation_metadata?.session_context === 'string',
        value: () => parsed.conversation_metadata?.session_context
      },
      {
        name: 'conversation_metadata.conversation_phase',
        check: () => typeof parsed.conversation_metadata?.conversation_phase === 'string',
        value: () => parsed.conversation_metadata?.conversation_phase
      },
      {
        name: 'turns array exists',
        check: () => Array.isArray(parsed.turns),
        value: () => `array with ${parsed.turns?.length || 0} turns`
      },
      {
        name: 'turns have required fields',
        check: () => {
          if (!parsed.turns || parsed.turns.length === 0) return false;
          return parsed.turns.every((turn: any) => 
            typeof turn.turn_number === 'number' &&
            typeof turn.role === 'string' &&
            typeof turn.content === 'string' &&
            turn.emotional_context &&
            typeof turn.emotional_context.primary_emotion === 'string' &&
            typeof turn.emotional_context.intensity === 'number'
          );
        },
        value: () => 'all turns valid'
      },
      {
        name: 'emotional context intensity in range',
        check: () => {
          if (!parsed.turns) return false;
          return parsed.turns.every((turn: any) => 
            turn.emotional_context.intensity >= 0 &&
            turn.emotional_context.intensity <= 1
          );
        },
        value: () => 'all intensities 0-1'
      }
    ];
    
    let allPassed = true;
    for (const validation of validations) {
      const passed = validation.check();
      const status = passed ? '✅' : '❌';
      const value = passed ? validation.value() : 'MISSING';
      console.log(`   ${status} ${validation.name}: ${value}`);
      if (!passed) allPassed = false;
    }
    
    if (!allPassed) {
      console.error('\n❌ Schema validation failed');
      console.log('\nFull response:');
      console.log(JSON.stringify(parsed, null, 2));
      process.exit(1);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All validations passed!');
    console.log('\n📊 Sample Data:');
    console.log(`   Client Persona: ${parsed.conversation_metadata.client_persona}`);
    console.log(`   Phase: ${parsed.conversation_metadata.conversation_phase}`);
    console.log(`   Number of turns: ${parsed.turns.length}`);
    if (parsed.turns.length > 0) {
      console.log(`   First turn emotion: ${parsed.turns[0].emotional_context.primary_emotion} (intensity: ${parsed.turns[0].emotional_context.intensity})`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 Structured outputs working correctly!');
    console.log('\nNext steps:');
    console.log('  1. Try generating a full conversation via the UI');
    console.log('  2. Monitor logs for "Using structured outputs" message');
    console.log('  3. Verify no JSON parse errors occur');
    console.log('  4. Compare parse rates with/without structured outputs\n');
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    if (error.status) {
      console.error(`   Status: ${error.status}`);
      console.error(`   Code: ${error.code}`);
    }
    if (error.details) {
      console.error('   Details:', JSON.stringify(error.details, null, 2));
    }
    console.log('\n' + '='.repeat(60));
    console.log('\nTroubleshooting:');
    console.log('  - Verify ANTHROPIC_API_KEY is set in environment');
    console.log('  - Check that model supports structured outputs (claude-3-5-sonnet+)');
    console.log('  - Ensure anthropic-beta header is correct');
    console.log('  - Review JSON schema for syntax errors\n');
    process.exit(1);
  }
}

// Run test
testStructuredOutputs();

