/**
 * Test Script: Truncation Detection
 * 
 * Verifies that truncation detection patterns work correctly
 * with various edge cases and content types.
 * 
 * Usage: npx tsx scripts/test-truncation-detection.ts
 */

import { detectTruncatedContent, getTruncationSummary } from '../src/lib/utils/truncation-detection';

const testCases = [
  { 
    content: 'This ends with a backslash \\', 
    expected: true, 
    pattern: 'lone_backslash',
    name: 'Lone backslash'
  },
  { 
    content: 'This ends with \\"', 
    expected: true, 
    pattern: 'escaped_quote',
    name: 'Escaped quote'
  },
  { 
    content: 'This is a complete sentence.', 
    expected: false, 
    pattern: null,
    name: 'Complete sentence'
  },
  { 
    content: 'This ends mid-w', 
    expected: true, 
    pattern: 'mid_word',
    name: 'Mid-word truncation'
  },
  { 
    content: 'List item,', 
    expected: true, 
    pattern: 'trailing_comma',
    name: 'Trailing comma'
  },
  { 
    content: 'Property:', 
    expected: true, 
    pattern: 'trailing_colon',
    name: 'Trailing colon'
  },
  { 
    content: 'Function call(', 
    expected: true, 
    pattern: 'open_paren',
    name: 'Open parenthesis'
  },
  { 
    content: 'Array start[', 
    expected: true, 
    pattern: 'open_bracket',
    name: 'Open bracket'
  },
  { 
    content: 'Object start{', 
    expected: true, 
    pattern: 'open_brace',
    name: 'Open brace'
  },
  { 
    content: 'This ends with proper punctuation!', 
    expected: false, 
    pattern: null,
    name: 'Exclamation mark'
  },
  { 
    content: 'Question at the end?', 
    expected: false, 
    pattern: null,
    name: 'Question mark'
  },
  { 
    content: '', 
    expected: false, 
    pattern: null,
    name: 'Empty content'
  },
];

console.log('Testing truncation detection patterns...\n');

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = detectTruncatedContent(test.content);
  const match = result.isTruncated === test.expected && result.pattern === test.pattern;
  
  if (match) {
    console.log(`✅ PASS: ${test.name}`);
    console.log(`   Content: "${test.content}"`);
    console.log(`   Pattern: ${result.pattern || 'none'}, Confidence: ${result.confidence}`);
    console.log(`   Summary: ${getTruncationSummary(result)}\n`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${test.name}`);
    console.log(`   Content: "${test.content}"`);
    console.log(`   Expected: ${test.expected} (${test.pattern || 'none'})`);
    console.log(`   Got: ${result.isTruncated} (${result.pattern || 'none'})`);
    console.log(`   Details: ${result.details}\n`);
    failed++;
  }
}

console.log(`\n=== RESULTS ===`);
console.log(`Passed: ${passed}/${testCases.length}`);
console.log(`Failed: ${failed}/${testCases.length}`);

if (failed === 0) {
  console.log('\n✅ All tests passed!');
  process.exit(0);
} else {
  console.log('\n❌ Some tests failed');
  process.exit(1);
}

