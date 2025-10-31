/**
 * Performance Benchmark Tests
 * 
 * Tests performance of critical operations:
 * 1. Batch generation throughput
 * 2. Query performance
 * 3. API response times
 * 4. Memory usage
 * 
 * Run with: node scripts/performance-tests.js
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const PERFORMANCE_THRESHOLDS = {
  singleGenerationMs: 10000, // 10 seconds
  batchGeneration100Items: 3600000, // 60 minutes
  queryResponseMs: 500, // 500ms for queries
  bulkActionMs: 2000, // 2 seconds for bulk actions
};

class PerformanceTester {
  constructor() {
    this.results = [];
  }

  async benchmark(name, fn, options = {}) {
    const { iterations = 1, threshold } = options;

    console.log(`\n⏱️  Benchmarking: ${name}`);

    const measurements = [];

    for (let i = 0; i < iterations; i++) {
      const startMemory = process.memoryUsage().heapUsed;
      const startTime = Date.now();

      try {
        await fn();
        const endTime = Date.now();
        const endMemory = process.memoryUsage().heapUsed;

        const duration = endTime - startTime;
        const memoryDelta = endMemory - startMemory;

        measurements.push({ duration, memoryDelta });

        if (iterations > 1) {
          process.stdout.write(`.`);
        }
      } catch (error) {
        console.error(`\n❌ Error in iteration ${i + 1}:`, error.message);
        throw error;
      }
    }

    if (iterations > 1) {
      console.log(''); // New line after dots
    }

    // Calculate statistics
    const durations = measurements.map((m) => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const p95Duration = this.percentile(durations, 95);

    const memoryDeltas = measurements.map((m) => m.memoryDelta);
    const avgMemory = memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length;

    const result = {
      name,
      iterations,
      avgDuration,
      minDuration,
      maxDuration,
      p95Duration,
      avgMemoryDelta: avgMemory,
      threshold,
      passed: threshold ? avgDuration <= threshold : true,
    };

    this.results.push(result);

    // Display results
    console.log(`   Avg Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`   Min Duration: ${minDuration.toFixed(2)}ms`);
    console.log(`   Max Duration: ${maxDuration.toFixed(2)}ms`);
    console.log(`   P95 Duration: ${p95Duration.toFixed(2)}ms`);
    console.log(`   Avg Memory: ${(avgMemory / 1024 / 1024).toFixed(2)} MB`);

    if (threshold) {
      if (result.passed) {
        console.log(`   ✅ PASS (threshold: ${threshold}ms)`);
      } else {
        console.log(`   ❌ FAIL (threshold: ${threshold}ms, got: ${avgDuration.toFixed(2)}ms)`);
      }
    }

    return result;
  }

  percentile(arr, p) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }

  summary() {
    console.log('\n' + '='.repeat(60));
    console.log('Performance Test Summary');
    console.log('='.repeat(60));

    const passed = this.results.filter((r) => r.passed).length;
    const failed = this.results.filter((r) => !r.passed).length;

    console.log(`\nTotal Tests: ${this.results.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    console.log('\nDetailed Results:');
    this.results.forEach((result) => {
      const status = result.passed ? '✅' : '❌';
      console.log(
        `  ${status} ${result.name}: ${result.avgDuration.toFixed(2)}ms (${result.iterations} iterations)`
      );
    });

    console.log('='.repeat(60));

    if (failed > 0) {
      process.exit(1);
    }
  }
}

// Performance Tests

async function testSingleGenerationPerformance(tester) {
  console.log('\n' + '='.repeat(60));
  console.log('Performance Test Suite 1: Single Generation');
  console.log('='.repeat(60));

  await tester.benchmark(
    'Single Conversation Generation',
    async () => {
      const response = await fetch(`${BASE_URL}/api/conversations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: '123e4567-e89b-12d3-a456-426614174000',
          parameters: { persona: 'Test', emotion: 'Happy' },
          tier: 'template',
          userId: 'perf-test-user',
        }),
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      await response.json();
    },
    {
      iterations: 5,
      threshold: PERFORMANCE_THRESHOLDS.singleGenerationMs,
    }
  );
}

async function testQueryPerformance(tester) {
  console.log('\n' + '='.repeat(60));
  console.log('Performance Test Suite 2: Query Performance');
  console.log('='.repeat(60));

  // Test: Get all conversations
  await tester.benchmark(
    'Get All Conversations (100 items)',
    async () => {
      const response = await fetch(`${BASE_URL}/api/conversations?limit=100`);
      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }
      await response.json();
    },
    {
      iterations: 10,
      threshold: PERFORMANCE_THRESHOLDS.queryResponseMs,
    }
  );

  // Test: Get with filters
  await tester.benchmark(
    'Get Conversations with Filters',
    async () => {
      const response = await fetch(
        `${BASE_URL}/api/conversations?tier=template&status=approved&limit=100`
      );
      if (!response.ok) {
        throw new Error(`Filtered query failed: ${response.statusText}`);
      }
      await response.json();
    },
    {
      iterations: 10,
      threshold: PERFORMANCE_THRESHOLDS.queryResponseMs,
    }
  );

  // Test: Get conversation with turns
  await tester.benchmark(
    'Get Single Conversation with Turns',
    async () => {
      // First get a conversation ID
      const listResponse = await fetch(`${BASE_URL}/api/conversations?limit=1`);
      const listData = await listResponse.json();

      if (listData.conversations && listData.conversations.length > 0) {
        const conversationId = listData.conversations[0].id;
        const response = await fetch(`${BASE_URL}/api/conversations/${conversationId}`);
        if (!response.ok) {
          throw new Error(`Get conversation failed: ${response.statusText}`);
        }
        await response.json();
      }
    },
    {
      iterations: 10,
      threshold: PERFORMANCE_THRESHOLDS.queryResponseMs,
    }
  );

  // Test: Get statistics
  await tester.benchmark(
    'Get Conversation Statistics',
    async () => {
      const response = await fetch(`${BASE_URL}/api/conversations/stats`);
      if (!response.ok) {
        throw new Error(`Stats query failed: ${response.statusText}`);
      }
      await response.json();
    },
    {
      iterations: 10,
      threshold: PERFORMANCE_THRESHOLDS.queryResponseMs,
    }
  );
}

async function testBulkOperationPerformance(tester) {
  console.log('\n' + '='.repeat(60));
  console.log('Performance Test Suite 3: Bulk Operations');
  console.log('='.repeat(60));

  // Get some conversation IDs for testing
  let conversationIds = [];
  try {
    const response = await fetch(`${BASE_URL}/api/conversations?limit=10`);
    const data = await response.json();
    conversationIds = data.conversations.map((c) => c.id);
  } catch (error) {
    console.log('⚠️  Could not fetch conversations for bulk operation test');
    return;
  }

  if (conversationIds.length === 0) {
    console.log('⚠️  No conversations available for bulk operation test');
    return;
  }

  await tester.benchmark(
    'Bulk Status Update (10 items)',
    async () => {
      const response = await fetch(`${BASE_URL}/api/conversations/bulk-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationIds: conversationIds.slice(0, 10),
          action: 'update_status',
          updates: { status: 'pending_review' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Bulk action failed: ${response.statusText}`);
      }
      await response.json();
    },
    {
      iterations: 5,
      threshold: PERFORMANCE_THRESHOLDS.bulkActionMs,
    }
  );
}

async function testBatchGenerationPerformance(tester) {
  console.log('\n' + '='.repeat(60));
  console.log('Performance Test Suite 4: Batch Generation');
  console.log('='.repeat(60));

  await tester.benchmark(
    'Batch Generation (10 conversations, concurrency=3)',
    async () => {
      // Start batch
      const response = await fetch(`${BASE_URL}/api/conversations/generate-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Performance Test Batch',
          parameterSets: Array(10)
            .fill(null)
            .map((_, i) => ({
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: { persona: `Test ${i}`, emotion: 'Neutral' },
              tier: 'template',
            })),
          userId: 'perf-test-user',
          concurrentProcessing: 3,
          errorHandling: 'continue',
        }),
      });

      if (!response.ok) {
        throw new Error(`Batch creation failed: ${response.statusText}`);
      }

      const data = await response.json();
      const jobId = data.jobId;

      // Poll for completion
      let completed = false;
      let attempts = 0;
      const maxAttempts = 120; // 2 minutes

      while (!completed && attempts < maxAttempts) {
        const statusResponse = await fetch(
          `${BASE_URL}/api/conversations/batch/${jobId}/status`
        );
        const statusData = await statusResponse.json();

        if (statusData.job.status === 'completed') {
          completed = true;
        } else if (statusData.job.status === 'failed') {
          throw new Error('Batch job failed');
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!completed) {
        throw new Error('Batch did not complete within timeout');
      }
    },
    {
      iterations: 1,
      threshold: 120000, // 2 minutes for 10 items
    }
  );
}

async function testConcurrentRequests(tester) {
  console.log('\n' + '='.repeat(60));
  console.log('Performance Test Suite 5: Concurrent Requests');
  console.log('='.repeat(60));

  await tester.benchmark(
    'Concurrent API Requests (10 parallel)',
    async () => {
      const requests = Array(10)
        .fill(null)
        .map(() =>
          fetch(`${BASE_URL}/api/conversations?limit=10`).then((r) => r.json())
        );

      await Promise.all(requests);
    },
    {
      iterations: 5,
      threshold: 2000, // 2 seconds for 10 concurrent requests
    }
  );

  await tester.benchmark(
    'Concurrent Generation Requests (5 parallel)',
    async () => {
      const requests = Array(5)
        .fill(null)
        .map((_, i) =>
          fetch(`${BASE_URL}/api/conversations/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              templateId: '123e4567-e89b-12d3-a456-426614174000',
              parameters: { persona: `Concurrent ${i}`, emotion: 'Happy' },
              tier: 'template',
              userId: 'perf-test-user',
            }),
          }).then((r) => r.json())
        );

      await Promise.all(requests);
    },
    {
      iterations: 2,
      threshold: 30000, // 30 seconds for 5 concurrent generations
    }
  );
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║       Performance Tests - Interactive LoRA Platform       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tester = new PerformanceTester();

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

    // Run performance tests
    await testQueryPerformance(tester);
    await testSingleGenerationPerformance(tester);
    await testBulkOperationPerformance(tester);
    await testConcurrentRequests(tester);

    // Optional: Long-running batch test (comment out if not needed)
    // await testBatchGenerationPerformance(tester);

    // Summary
    tester.summary();

    console.log('\n✅ Performance tests completed!\n');
  } catch (error) {
    console.error('\n❌ Performance test suite failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { PerformanceTester };

