/**
 * Test script for Export Transformers
 * Run with: npx tsx src/lib/export-transformers/test-transformers.ts
 */

import { JSONLTransformer } from './jsonl-transformer';
import { JSONTransformer } from './json-transformer';
import { getTransformer } from './index';
import {
  Conversation,
  ConversationTurn,
  ExportConfig,
} from '../../../@/lib/types';

// Sample test data
const testConversations: Conversation[] = [
  {
    id: '1',
    conversation_id: 'test-001',
    title: 'Market Volatility Discussion',
    category: ['Finance', 'Investment'],
    status: 'approved',
    qualityScore: 8.5,
    persona: 'Anxious Investor',
    emotion: 'Fear',
    topic: 'Market Volatility',
    tier: 'template',
    totalTurns: 4,
    tokenCount: 500,
    parentId: 'template-001',
    parentType: 'template',
    parameters: { complexity: 'medium' },
    reviewHistory: [
      {
        action: 'approved',
        userId: 'reviewer-1',
        timestamp: '2025-10-29T11:00:00Z',
        notes: 'Quality content',
      },
    ],
    createdAt: '2025-10-29T10:00:00Z',
    updatedAt: '2025-10-29T11:00:00Z',
  },
  {
    id: '2',
    conversation_id: 'test-002',
    title: 'Investment Strategy Planning',
    category: ['Finance', 'Planning'],
    status: 'approved',
    qualityScore: 9.2,
    persona: 'Conservative Investor',
    emotion: 'Cautious',
    topic: 'Long-term Planning',
    tier: 'generated',
    totalTurns: 6,
    tokenCount: 750,
    parameters: {},
    reviewHistory: [],
    createdAt: '2025-10-30T14:00:00Z',
    updatedAt: '2025-10-30T15:00:00Z',
  },
];

const testTurns = new Map<string, ConversationTurn[]>();
testTurns.set('test-001', [
  {
    role: 'user',
    content: "I'm worried about the recent market crash. Should I sell everything?",
    tokenCount: 15,
  },
  {
    role: 'assistant',
    content:
      "I understand your concern about market volatility. Let me help you understand what's happening and explore your options.",
    tokenCount: 25,
  },
  {
    role: 'user',
    content: 'What should I do with my retirement investments?',
    tokenCount: 10,
  },
  {
    role: 'assistant',
    content:
      'For retirement investments, the key is maintaining a long-term perspective. Here are some strategies to consider: diversification, dollar-cost averaging, and regular portfolio rebalancing.',
    tokenCount: 35,
  },
]);

testTurns.set('test-002', [
  {
    role: 'user',
    content: 'I want to plan my investment strategy for the next 10 years.',
    tokenCount: 15,
  },
  {
    role: 'assistant',
    content:
      "That's an excellent approach. Long-term planning is crucial for financial success. Let's break down the key components.",
    tokenCount: 25,
  },
  {
    role: 'user',
    content: 'What asset allocation do you recommend?',
    tokenCount: 8,
  },
  {
    role: 'assistant',
    content:
      'Asset allocation depends on your risk tolerance, time horizon, and financial goals. For a 10-year plan, a balanced approach might include 60% stocks, 30% bonds, and 10% alternative investments.',
    tokenCount: 40,
  },
  {
    role: 'user',
    content: 'How often should I rebalance my portfolio?',
    tokenCount: 9,
  },
  {
    role: 'assistant',
    content:
      'Generally, rebalancing annually or when allocations drift by more than 5% from targets is a good practice. This helps maintain your desired risk level.',
    tokenCount: 30,
  },
]);

// Test configurations
const fullConfig: ExportConfig = {
  scope: 'all',
  format: 'jsonl',
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: true,
  includeParentReferences: true,
  includeFullContent: true,
};

const minimalConfig: ExportConfig = {
  scope: 'all',
  format: 'jsonl',
  includeMetadata: false,
  includeQualityScores: false,
  includeTimestamps: false,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true,
};

async function runTests() {
  console.log('=== Export Transformer Tests ===\n');

  // Test 1: JSONL Transformer with full metadata
  console.log('Test 1: JSONL Transformer (Full Metadata)');
  console.log('-------------------------------------------');
  const jsonlTransformer = new JSONLTransformer();
  const jsonlOutput = await jsonlTransformer.transform(
    testConversations,
    testTurns,
    fullConfig
  );
  console.log('Output:');
  console.log(jsonlOutput);
  console.log();

  // Validate JSONL output
  try {
    const isValid = jsonlTransformer.validateOutput(jsonlOutput);
    console.log('✅ JSONL validation passed:', isValid);
  } catch (error) {
    console.error('❌ JSONL validation failed:', (error as Error).message);
  }
  console.log();

  // Test 2: JSONL Transformer with minimal metadata
  console.log('Test 2: JSONL Transformer (Minimal Metadata)');
  console.log('---------------------------------------------');
  const jsonlMinimalOutput = await jsonlTransformer.transform(
    testConversations,
    testTurns,
    minimalConfig
  );
  console.log('Output:');
  console.log(jsonlMinimalOutput);
  console.log();

  // Test 3: JSON Transformer with full metadata
  console.log('Test 3: JSON Transformer (Full Metadata)');
  console.log('-----------------------------------------');
  const jsonTransformer = new JSONTransformer();
  const jsonConfig = { ...fullConfig, format: 'json' as const };
  const jsonOutput = await jsonTransformer.transform(
    testConversations,
    testTurns,
    jsonConfig
  );
  console.log('Output:');
  console.log(jsonOutput);
  console.log();

  // Validate JSON output
  try {
    const isValid = jsonTransformer.validateOutput(jsonOutput);
    console.log('✅ JSON validation passed:', isValid);
  } catch (error) {
    console.error('❌ JSON validation failed:', (error as Error).message);
  }
  console.log();

  // Test 4: Factory function
  console.log('Test 4: Factory Function');
  console.log('------------------------');
  try {
    const jsonlFromFactory = getTransformer('jsonl');
    console.log('✅ JSONL transformer from factory:', jsonlFromFactory.getFileExtension());

    const jsonFromFactory = getTransformer('json');
    console.log('✅ JSON transformer from factory:', jsonFromFactory.getFileExtension());

    console.log('✅ JSONL MIME type:', jsonlFromFactory.getMimeType());
    console.log('✅ JSON MIME type:', jsonFromFactory.getMimeType());
  } catch (error) {
    console.error('❌ Factory function failed:', (error as Error).message);
  }
  console.log();

  // Test 5: Error handling for unsupported formats
  console.log('Test 5: Error Handling (Unsupported Formats)');
  console.log('---------------------------------------------');
  try {
    getTransformer('csv');
    console.error('❌ Should have thrown error for CSV');
  } catch (error) {
    console.log('✅ CSV error caught:', (error as Error).message);
  }

  try {
    getTransformer('markdown');
    console.error('❌ Should have thrown error for Markdown');
  } catch (error) {
    console.log('✅ Markdown error caught:', (error as Error).message);
  }
  console.log();

  // Test 6: Large dataset simulation
  console.log('Test 6: Large Dataset (100 conversations)');
  console.log('------------------------------------------');
  const largeConversations = Array.from({ length: 100 }, (_, i) => ({
    ...testConversations[0],
    id: `${i + 1}`,
    conversation_id: `test-${(i + 1).toString().padStart(3, '0')}`,
    title: `Test Conversation ${i + 1}`,
  }));

  const largeTurns = new Map<string, ConversationTurn[]>();
  largeConversations.forEach((conv) => {
    largeTurns.set(conv.conversation_id, testTurns.get('test-001')!);
  });

  const largeOutput = await jsonlTransformer.transform(
    largeConversations,
    largeTurns,
    minimalConfig
  );
  const largeLines = largeOutput.split('\n').filter((l) => l.trim());

  console.log(`✅ Generated ${largeLines.length} lines`);
  console.log(`✅ Output size: ${largeOutput.length} bytes`);
  console.log(`✅ Average bytes per conversation: ${Math.round(largeOutput.length / 100)}`);
  console.log();

  // Test 7: Validation error detection
  console.log('Test 7: Validation Error Detection');
  console.log('-----------------------------------');

  // Test invalid JSON
  try {
    jsonlTransformer.validateOutput('not valid json\n{"incomplete":');
    console.error('❌ Should have detected invalid JSON');
  } catch (error) {
    console.log('✅ Invalid JSON detected:', (error as Error).message);
  }

  // Test missing messages field
  try {
    jsonlTransformer.validateOutput('{"no_messages_field": true}');
    console.error('❌ Should have detected missing messages field');
  } catch (error) {
    console.log('✅ Missing messages field detected:', (error as Error).message);
  }

  // Test invalid role
  try {
    jsonlTransformer.validateOutput(
      '{"messages": [{"role": "invalid", "content": "test"}]}'
    );
    console.error('❌ Should have detected invalid role');
  } catch (error) {
    console.log('✅ Invalid role detected:', (error as Error).message);
  }

  // Test JSON transformer validation
  try {
    jsonTransformer.validateOutput('{"version": "1.0"}');
    console.error('❌ Should have detected incomplete JSON export');
  } catch (error) {
    console.log('✅ Incomplete JSON export detected:', (error as Error).message);
  }

  console.log();
  console.log('=== All Tests Complete ===');
}

// Run tests
runTests().catch((error) => {
  console.error('Test execution failed:', error);
  process.exit(1);
});

