/**
 * Test JSON Repair Pipeline (Prompt 3)
 * 
 * Tests the three-tier JSON parsing strategy:
 * 1. Direct JSON.parse() (95% success with structured outputs)
 * 2. jsonrepair library (4% additional success)
 * 3. Manual review (1% remaining failures)
 */

// Load environment variables manually
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { ConversationStorageService } from '../lib/services/conversation-storage-service';

async function testJSONRepair() {
  const service = new ConversationStorageService();
  
  console.log('Testing JSON Repair Pipeline...\n');
  console.log('===============================================\n');
  
  // TEST 1: Valid JSON (should succeed with direct parse)
  console.log('Test 1: Valid JSON (Expected: direct parse)');
  console.log('-------------------------------------------');
  const validJSON = JSON.stringify({
    conversation_metadata: {
      client_persona: "Test User",
      session_context: "Testing",
      conversation_phase: "initial"
    },
    turns: [
      {
        turn_number: 1,
        role: "user",
        content: "Hello",
        emotional_context: {
          primary_emotion: "neutral",
          intensity: 0.5
        }
      }
    ]
  });
  
  const test1 = await service.parseAndStoreFinal({
    conversationId: `test-valid-${Date.now()}`,
    rawResponse: validJSON,
    userId: 'test-user'
  });
  
  console.log(`Result: ${test1.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Method: ${test1.parseMethod}`);
  if (test1.parseMethod !== 'direct') {
    console.error('❌ FAIL: Expected direct parse for valid JSON');
    process.exit(1);
  }
  console.log('✅ PASS: Direct parse worked as expected\n');
  
  // TEST 2: Malformed JSON with trailing comma (jsonrepair should fix)
  console.log('Test 2: Trailing comma (Expected: jsonrepair)');
  console.log('-------------------------------------------');
  const trailingCommaJSON = `{
    "conversation_metadata": {
      "client_persona": "Test User",
      "session_context": "Testing",
      "conversation_phase": "initial",
    },
    "turns": []
  }`;
  
  const test2 = await service.parseAndStoreFinal({
    conversationId: `test-trailing-${Date.now()}`,
    rawResponse: trailingCommaJSON,
    userId: 'test-user'
  });
  
  console.log(`Result: ${test2.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Method: ${test2.parseMethod}`);
  if (test2.parseMethod !== 'jsonrepair') {
    console.error('❌ FAIL: Expected jsonrepair for trailing comma');
    process.exit(1);
  }
  console.log('✅ PASS: jsonrepair fixed trailing comma\n');
  
  // TEST 3: Unescaped quotes (jsonrepair should fix)
  console.log('Test 3: Unescaped quotes (Expected: jsonrepair)');
  console.log('-------------------------------------------');
  const unescapedJSON = `{
    "conversation_metadata": {
      "client_persona": "User says "hello"",
      "session_context": "Testing",
      "conversation_phase": "initial"
    },
    "turns": []
  }`;
  
  const test3 = await service.parseAndStoreFinal({
    conversationId: `test-unescaped-${Date.now()}`,
    rawResponse: unescapedJSON,
    userId: 'test-user'
  });
  
  console.log(`Result: ${test3.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Method: ${test3.parseMethod}`);
  if (test3.parseMethod !== 'jsonrepair') {
    console.error('❌ FAIL: Expected jsonrepair for unescaped quotes');
    process.exit(1);
  }
  console.log('✅ PASS: jsonrepair fixed unescaped quotes\n');
  
  // TEST 4: Completely invalid JSON (should fail)
  console.log('Test 4: Completely invalid JSON (Expected: failed)');
  console.log('-------------------------------------------');
  const invalidJSON = 'This is not JSON at all!';
  
  const test4 = await service.parseAndStoreFinal({
    conversationId: `test-invalid-${Date.now()}`,
    rawResponse: invalidJSON,
    userId: 'test-user'
  });
  
  console.log(`Result: ${test4.success ? '❌ UNEXPECTED SUCCESS' : '✅ CORRECTLY FAILED'}`);
  console.log(`Method: ${test4.parseMethod}`);
  if (test4.success || test4.parseMethod !== 'failed') {
    console.error('❌ FAIL: Should have failed for completely invalid JSON');
    process.exit(1);
  }
  console.log('✅ PASS: Correctly failed for invalid JSON\n');
  
  console.log('===============================================');
  console.log('🎉 All tests passed!');
  console.log('===============================================\n');
  console.log('Summary:');
  console.log('- Test 1: Direct parse ✅');
  console.log('- Test 2: jsonrepair (trailing comma) ✅');
  console.log('- Test 3: jsonrepair (unescaped quotes) ✅');
  console.log('- Test 4: Correctly failed ✅');
  console.log('\nJSON repair pipeline is working correctly!');
}

// Run tests
testJSONRepair().catch((error) => {
  console.error('❌ Test suite failed with error:', error);
  process.exit(1);
});

