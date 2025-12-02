/**
 * Test Script: stop_reason Capture
 * 
 * Verifies that stop_reason is captured from Claude API responses
 * and logged correctly for every generation.
 * 
 * Usage: npx tsx scripts/test-stop-reason-capture.ts
 */

import { getClaudeAPIClient } from '../src/lib/services/claude-api-client';

const client = getClaudeAPIClient();

const testPrompt = `Generate a JSON conversation with 3 turns between a user and financial advisor about retirement planning.`;

(async () => {
  console.log('Testing stop_reason capture...\n');
  
  try {
    const response = await client.generateConversation(testPrompt, {
      conversationId: 'test-stop-reason',
      userId: '00000000-0000-0000-0000-000000000000',
      maxTokens: 4000,
    });

    console.log('\n=== RESPONSE ===');
    console.log('stop_reason:', response.stop_reason);
    console.log('output_tokens:', response.usage.output_tokens);
    console.log('content length:', response.content.length);

    // Verify stop_reason is present
    if (!response.stop_reason) {
      console.error('❌ FAIL: stop_reason is missing!');
      process.exit(1);
    }

    // Verify it's one of the expected values
    const validStopReasons = ['end_turn', 'max_tokens', 'stop_sequence', 'tool_use'];
    if (!validStopReasons.includes(response.stop_reason)) {
      console.error(`❌ FAIL: stop_reason "${response.stop_reason}" is not a valid value`);
      console.error(`   Expected one of: ${validStopReasons.join(', ')}`);
      process.exit(1);
    }

    console.log('\n✅ PASS: stop_reason captured successfully');
    console.log(`   Value: ${response.stop_reason}`);
    console.log(`   Tokens: ${response.usage.output_tokens}/${4000}`);
  } catch (error) {
    console.error('\n❌ FAIL: Error during test:', error);
    process.exit(1);
  }
})();

