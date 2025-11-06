/**
 * Test script to generate sample CSV and Markdown exports
 * Demonstrates proper formatting and validates transformer functionality
 */

import { getTransformer } from './index';
import { Conversation, ConversationTurn, ExportConfig } from '@/lib/types';
import * as fs from 'fs';
import * as path from 'path';

// Sample test data with edge cases (quotes, commas, newlines)
const sampleConversations: Conversation[] = [
  {
    id: 'conv-001',
    title: 'Getting Started with LoRA Training',
    persona: 'Technical Expert',
    emotion: 'helpful',
    tier: 'template',
    category: ['technical', 'tutorial'],
    status: 'approved',
    qualityScore: 8.5,
    createdAt: '2025-10-29T10:30:00Z',
    updatedAt: '2025-10-29T14:20:00Z',
    createdBy: 'user-123',
    turns: [],
    totalTurns: 3,
    totalTokens: 450,
    parentId: 'template-001',
    parentType: 'template',
    parameters: {},
    reviewHistory: [],
  },
  {
    id: 'conv-002',
    title: 'Edge Case: Handling "Quotes", Commas, and\nNewlines',
    persona: 'Tester',
    emotion: 'analytical',
    tier: 'edge_case',
    category: ['testing', 'validation'],
    status: 'pending_review',
    qualityScore: 7.2,
    createdAt: '2025-10-30T08:15:00Z',
    updatedAt: '2025-10-30T09:45:00Z',
    createdBy: 'user-456',
    turns: [],
    totalTurns: 2,
    totalTokens: 320,
    parentId: 'scenario-042',
    parentType: 'scenario',
    parameters: {},
    reviewHistory: [],
  },
];

// Sample turns with special characters
const sampleTurns = new Map<string, ConversationTurn[]>([
  [
    'conv-001',
    [
      {
        role: 'user',
        content: 'Can you explain what LoRA training is?',
        timestamp: '2025-10-29T10:30:00Z',
        tokenCount: 10,
      },
      {
        role: 'assistant',
        content:
          'LoRA (Low-Rank Adaptation) is a parameter-efficient fine-tuning technique. It allows you to adapt large language models by training only a small number of additional parameters, making the process faster and more memory-efficient.',
        timestamp: '2025-10-29T10:30:15Z',
        tokenCount: 50,
      },
      {
        role: 'user',
        content: 'What are the main benefits?',
        timestamp: '2025-10-29T10:30:30Z',
        tokenCount: 8,
      },
    ],
  ],
  [
    'conv-002',
    [
      {
        role: 'user',
        content:
          'Test content with "quotes", commas, and newlines:\n- Item 1\n- Item 2\n- Item 3',
        timestamp: '2025-10-30T08:15:00Z',
        tokenCount: 25,
      },
      {
        role: 'assistant',
        content:
          'I can handle special characters like:\n1. "Double quotes"\n2. Commas, in text\n3. Multiple\nNewlines\n\nNo problem!',
        timestamp: '2025-10-30T08:15:30Z',
        tokenCount: 35,
      },
    ],
  ],
]);

// Export configuration
const exportConfig: ExportConfig = {
  scope: 'all',
  format: 'csv', // Will be changed for each export
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: false,
  includeParentReferences: true,
  includeFullContent: true,
};

async function generateSampleExports() {
  console.log('🚀 Generating sample exports...\n');

  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '../../../sample-exports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Generate CSV export
    console.log('📊 Generating CSV export...');
    const csvConfig = { ...exportConfig, format: 'csv' as const };
    const csvTransformer = getTransformer('csv');
    const csvOutput = await csvTransformer.transform(
      sampleConversations,
      sampleTurns,
      csvConfig
    );
    const csvPath = path.join(outputDir, 'test-output.csv');
    fs.writeFileSync(csvPath, csvOutput, 'utf-8');
    console.log(`✅ CSV export saved to: ${csvPath}`);
    console.log(`   Size: ${csvOutput.length} bytes`);
    console.log(`   Rows: ${csvOutput.split('\n').length - 1} (including header)\n`);

    // Validate CSV output
    console.log('🔍 Validating CSV output...');
    csvTransformer.validateOutput(csvOutput);
    console.log('✅ CSV validation passed\n');

    // Generate Markdown export
    console.log('📝 Generating Markdown export...');
    const mdConfig = { ...exportConfig, format: 'markdown' as const };
    const mdTransformer = getTransformer('markdown');
    const mdOutput = await mdTransformer.transform(
      sampleConversations,
      sampleTurns,
      mdConfig
    );
    const mdPath = path.join(outputDir, 'test-output.md');
    fs.writeFileSync(mdPath, mdOutput, 'utf-8');
    console.log(`✅ Markdown export saved to: ${mdPath}`);
    console.log(`   Size: ${mdOutput.length} bytes`);
    console.log(`   Lines: ${mdOutput.split('\n').length}\n`);

    // Validate Markdown output
    console.log('🔍 Validating Markdown output...');
    mdTransformer.validateOutput(mdOutput);
    console.log('✅ Markdown validation passed\n');

    // Test factory function
    console.log('🏭 Testing factory function...');
    const jsonlTransformer = getTransformer('jsonl');
    console.log(`✅ JSONL transformer: ${jsonlTransformer.getFileExtension()}`);
    const jsonTransformer = getTransformer('json');
    console.log(`✅ JSON transformer: ${jsonTransformer.getFileExtension()}`);
    const csvTransformer2 = getTransformer('csv');
    console.log(`✅ CSV transformer: ${csvTransformer2.getFileExtension()}`);
    const mdTransformer2 = getTransformer('markdown');
    console.log(`✅ Markdown transformer: ${mdTransformer2.getFileExtension()}\n`);

    console.log('🎉 All tests passed successfully!');
    console.log(`\n📁 Sample exports available at: ${outputDir}`);
  } catch (error) {
    console.error('❌ Error generating exports:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateSampleExports();
}

export { generateSampleExports, sampleConversations, sampleTurns };

