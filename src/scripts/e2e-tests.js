/**
 * End-to-End Test Scripts
 * 
 * Comprehensive E2E tests for critical user workflows:
 * 1. Complete Batch Generation Workflow
 * 2. Single Generation Workflow
 * 3. Regeneration Workflow
 * 
 * Run with: node scripts/e2e-tests.js
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = 60000; // 60 seconds

// Test utilities
class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.tests = [];
  }

  async test(name, fn) {
    console.log(`\n🧪 Testing: ${name}`);
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      this.passed++;
    } catch (error) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${error.message}`);
      this.failed++;
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(
        message || `Expected ${expected}, got ${actual}`
      );
    }
  }

  assertGreaterThan(actual, expected, message) {
    if (actual <= expected) {
      throw new Error(
        message || `Expected ${actual} to be greater than ${expected}`
      );
    }
  }

  async summary() {
    console.log('\n' + '='.repeat(60));
    console.log(`Test Summary:`);
    console.log(`  Passed: ${this.passed}`);
    console.log(`  Failed: ${this.failed}`);
    console.log(`  Total:  ${this.passed + this.failed}`);
    console.log('='.repeat(60));

    if (this.failed > 0) {
      process.exit(1);
    }
  }
}

// Test Suites

async function testSingleGenerationWorkflow(runner) {
  console.log('\n' + '='.repeat(60));
  console.log('E2E Test Suite 1: Single Generation Workflow');
  console.log('='.repeat(60));

  let conversationId;

  await runner.test('Step 1: Create a template', async () => {
    const response = await fetch(`${BASE_URL}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Template',
        content: 'User is {{persona}} feeling {{emotion}}',
        system_prompt: 'You are a helpful assistant',
        variables: ['persona', 'emotion'],
      }),
    });

    runner.assert(response.ok, 'Template creation should succeed');
    const data = await response.json();
    runner.assert(data.id, 'Template should have an ID');
  });

  await runner.test('Step 2: Generate single conversation', async () => {
    const response = await fetch(`${BASE_URL}/api/conversations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '123e4567-e89b-12d3-a456-426614174000', // Use a valid test template ID
        parameters: {
          persona: 'Anxious Investor',
          emotion: 'Worried',
          topic: 'Market Volatility',
        },
        tier: 'template',
        userId: 'e2e-test-user',
      }),
    });

    runner.assert(response.ok, 'Generation should succeed');
    const data = await response.json();
    runner.assert(data.success, 'Generation should be successful');
    runner.assert(data.conversation, 'Should return conversation');
    runner.assert(data.conversation.id, 'Conversation should have ID');
    conversationId = data.conversation.id;

    // Verify quality metrics
    runner.assert(data.qualityMetrics, 'Should return quality metrics');
    runner.assertGreaterThan(data.qualityMetrics.qualityScore, 0, 'Quality score should be > 0');
    runner.assertGreaterThan(data.qualityMetrics.turnCount, 0, 'Turn count should be > 0');
  });

  await runner.test('Step 3: Fetch generated conversation', async () => {
    if (!conversationId) {
      throw new Error('No conversation ID from previous step');
    }

    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`);
    runner.assert(response.ok, 'Fetch should succeed');

    const data = await response.json();
    runner.assert(data.conversation, 'Should return conversation');
    runner.assertEqual(data.conversation.id, conversationId, 'IDs should match');
    runner.assert(data.conversation.turns, 'Should include turns');
    runner.assertGreaterThan(data.conversation.turns.length, 0, 'Should have turns');
  });

  await runner.test('Step 4: Update conversation status', async () => {
    if (!conversationId) {
      throw new Error('No conversation ID from previous step');
    }

    const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'approved',
        reviewNotes: 'E2E test approval',
      }),
    });

    runner.assert(response.ok, 'Update should succeed');
    const data = await response.json();
    runner.assertEqual(data.conversation.status, 'approved', 'Status should be updated');
  });

  await runner.test('Step 5: Export conversation', async () => {
    const response = await fetch(`${BASE_URL}/api/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationIds: [conversationId],
        format: 'jsonl',
      }),
    });

    runner.assert(response.ok, 'Export should succeed');
    const data = await response.json();
    runner.assert(data.url || data.data, 'Should return export data');
  });
}

async function testBatchGenerationWorkflow(runner) {
  console.log('\n' + '='.repeat(60));
  console.log('E2E Test Suite 2: Batch Generation Workflow');
  console.log('='.repeat(60));

  let batchJobId;

  await runner.test('Step 1: Start batch generation', async () => {
    const response = await fetch(`${BASE_URL}/api/conversations/generate-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Batch',
        parameterSets: [
          {
            templateId: '123e4567-e89b-12d3-a456-426614174000',
            parameters: { persona: 'Investor 1', emotion: 'Happy' },
            tier: 'template',
          },
          {
            templateId: '123e4567-e89b-12d3-a456-426614174000',
            parameters: { persona: 'Investor 2', emotion: 'Worried' },
            tier: 'template',
          },
          {
            templateId: '123e4567-e89b-12d3-a456-426614174000',
            parameters: { persona: 'Investor 3', emotion: 'Neutral' },
            tier: 'scenario',
          },
        ],
        userId: 'e2e-test-user',
        concurrentProcessing: 2,
        errorHandling: 'continue',
      }),
    });

    runner.assert(response.ok, 'Batch creation should succeed');
    const data = await response.json();
    runner.assert(data.success, 'Batch should be created successfully');
    runner.assert(data.jobId, 'Should return job ID');
    batchJobId = data.jobId;

    runner.assert(data.estimatedCost, 'Should include cost estimate');
    runner.assertGreaterThan(data.estimatedCost, 0, 'Estimated cost should be > 0');
  });

  await runner.test('Step 2: Check batch job status', async () => {
    if (!batchJobId) {
      throw new Error('No batch job ID from previous step');
    }

    // Wait a moment for job to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await fetch(`${BASE_URL}/api/conversations/batch/${batchJobId}/status`);
    runner.assert(response.ok, 'Status check should succeed');

    const data = await response.json();
    runner.assert(data.job, 'Should return job data');
    runner.assert(
      ['queued', 'processing', 'completed'].includes(data.job.status),
      'Job should have valid status'
    );
    runner.assert(data.job.progress, 'Should include progress');
  });

  await runner.test('Step 3: Monitor batch progress', async () => {
    if (!batchJobId) {
      throw new Error('No batch job ID from previous step');
    }

    // Poll for completion (with timeout)
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds

    while (!completed && attempts < maxAttempts) {
      const response = await fetch(`${BASE_URL}/api/conversations/batch/${batchJobId}/status`);
      const data = await response.json();

      if (data.job.status === 'completed') {
        completed = true;
        runner.assertEqual(data.job.progress.total, 3, 'Should process 3 items');
        runner.assertGreaterThan(data.job.progress.successful, 0, 'Should have successful items');
      } else if (data.job.status === 'failed') {
        throw new Error('Batch job failed');
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    runner.assert(completed, 'Batch should complete within timeout');
  });

  await runner.test('Step 4: Retrieve generated conversations', async () => {
    const response = await fetch(`${BASE_URL}/api/conversations?userId=e2e-test-user&limit=10`);
    runner.assert(response.ok, 'Fetch should succeed');

    const data = await response.json();
    runner.assert(data.conversations, 'Should return conversations');
    runner.assertGreaterThan(
      data.conversations.length,
      0,
      'Should have generated conversations'
    );
  });

  await runner.test('Step 5: Bulk approve conversations', async () => {
    // Get conversations from batch
    const fetchResponse = await fetch(`${BASE_URL}/api/conversations?limit=3`);
    const fetchData = await fetchResponse.json();
    const conversationIds = fetchData.conversations.map((c) => c.id);

    const response = await fetch(`${BASE_URL}/api/conversations/bulk-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversationIds,
        action: 'approve',
        updates: { status: 'approved' },
      }),
    });

    runner.assert(response.ok, 'Bulk action should succeed');
    const data = await response.json();
    runner.assert(data.success, 'Bulk action should be successful');
    runner.assertGreaterThan(data.updated, 0, 'Should update conversations');
  });
}

async function testRegenerationWorkflow(runner) {
  console.log('\n' + '='.repeat(60));
  console.log('E2E Test Suite 3: Regeneration Workflow');
  console.log('='.repeat(60));

  let originalId;
  let regeneratedId;

  await runner.test('Step 1: Create initial conversation', async () => {
    const response = await fetch(`${BASE_URL}/api/conversations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '123e4567-e89b-12d3-a456-426614174000',
        parameters: { persona: 'Test User', emotion: 'Happy' },
        tier: 'template',
        userId: 'e2e-test-user',
      }),
    });

    runner.assert(response.ok, 'Generation should succeed');
    const data = await response.json();
    originalId = data.conversation.id;
  });

  await runner.test('Step 2: Regenerate conversation', async () => {
    if (!originalId) {
      throw new Error('No original conversation ID');
    }

    const response = await fetch(`${BASE_URL}/api/conversations/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: '123e4567-e89b-12d3-a456-426614174000',
        parameters: { persona: 'Test User', emotion: 'Excited' }, // Modified parameter
        tier: 'template',
        userId: 'e2e-test-user',
        parentId: originalId,
        parentType: 'regeneration',
      }),
    });

    runner.assert(response.ok, 'Regeneration should succeed');
    const data = await response.json();
    regeneratedId = data.conversation.id;
    runner.assert(regeneratedId !== originalId, 'Should create new conversation');
  });

  await runner.test('Step 3: Verify original archived', async () => {
    if (!originalId) {
      throw new Error('No original conversation ID');
    }

    const response = await fetch(`${BASE_URL}/api/conversations/${originalId}`);
    const data = await response.json();

    runner.assertEqual(
      data.conversation.status,
      'archived',
      'Original should be archived'
    );
  });

  await runner.test('Step 4: Verify link between conversations', async () => {
    if (!regeneratedId) {
      throw new Error('No regenerated conversation ID');
    }

    const response = await fetch(`${BASE_URL}/api/conversations/${regeneratedId}`);
    const data = await response.json();

    runner.assertEqual(
      data.conversation.parentId,
      originalId,
      'Should link to original'
    );
    runner.assertEqual(
      data.conversation.parentType,
      'regeneration',
      'Should have regeneration type'
    );
  });
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        End-to-End Tests - Interactive LoRA Platform       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const runner = new TestRunner();

  try {
    // Check server availability
    console.log(`\nChecking server at ${BASE_URL}...`);
    try {
      await fetch(BASE_URL);
      console.log('✅ Server is reachable\n');
    } catch (error) {
      console.error('❌ Server is not reachable. Please start the server first.');
      process.exit(1);
    }

    // Run test suites
    await testSingleGenerationWorkflow(runner);
    await testBatchGenerationWorkflow(runner);
    await testRegenerationWorkflow(runner);

    // Summary
    await runner.summary();

    console.log('\n✅ All E2E tests completed!\n');
  } catch (error) {
    console.error('\n❌ E2E test suite failed with error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { testSingleGenerationWorkflow, testBatchGenerationWorkflow, testRegenerationWorkflow };

