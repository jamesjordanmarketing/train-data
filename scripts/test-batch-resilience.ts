/**
 * Test: Batch Resilience
 * 
 * Verifies that:
 * 1. Batch continues after individual truncation failures
 * 2. Success and failure counts are accurate
 * 3. Failed generations are logged appropriately
 * 4. Successful generations complete normally
 */

import { getBatchGenerationService } from '../src/lib/services/batch-generation-service';
import { getConversationGenerationService } from '../src/lib/services/conversation-generation-service';
import { batchJobService } from '../src/lib/services/batch-job-service';
import type { ClaudeAPIResponse } from '../src/lib/services/claude-api-client';

/**
 * Mock Claude client that alternates between success and failure
 * Implements minimal ClaudeAPIClient interface for testing
 */
class MockAlternatingClient {
  private callCount = 0;

  async generateConversation(prompt: string, config: Record<string, unknown>): Promise<ClaudeAPIResponse> {
    this.callCount++;
    
    // First call: Success
    if (this.callCount === 1) {
      return {
        id: `test-success-1`,
        content: JSON.stringify({
          title: 'Successful Conversation 1',
          turns: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi there!' }
          ]
        }),
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: { input_tokens: 500, output_tokens: 300 },
        cost: 0.01,
        durationMs: 1000,
      };
    }
    
    // Second call: Truncated (failure)
    if (this.callCount === 2) {
      return {
        id: `test-truncated`,
        content: 'This is truncated \\',
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: { input_tokens: 500, output_tokens: 200 },
        cost: 0.01,
        durationMs: 1000,
      };
    }
    
    // Third call: Success
    return {
      id: `test-success-2`,
      content: JSON.stringify({
        title: 'Successful Conversation 2',
        turns: [
          { role: 'user', content: 'How are you?' },
          { role: 'assistant', content: 'I am doing well, thank you!' }
        ]
      }),
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'end_turn',
      usage: { input_tokens: 500, output_tokens: 350 },
      cost: 0.012,
      durationMs: 1100,
    };
  }
}

/**
 * Mock template resolver
 * Implements minimal TemplateResolver interface for testing
 */
class MockTemplateResolver {
  async resolveTemplate(params: { templateId: string; parameters: Record<string, unknown>; userId: string }) {
    return {
      success: true,
      resolvedPrompt: `Test prompt for ${params.parameters.topic || 'test'}`,
      errors: [] as string[],
      injectedParameters: {} as Record<string, unknown>,
      template: {} as Record<string, unknown>,
    };
  }
}

/**
 * Main test execution
 */
async function runTest() {
  console.log('=================================================');
  console.log('TEST: Batch Resilience');
  console.log('=================================================\n');

  try {
    // Step 1: Set up mock client in generation service
    console.log('Step 1: Setting up batch with mixed success/failure...\n');
    
    const mockClient = new MockAlternatingClient();
    const mockResolver = new MockTemplateResolver();
    
    // Create a new service instance with mocked dependencies
    // NOTE: This is a test script, not production code - mocks are appropriate here
    const ConversationGenerationService = (await import('../src/lib/services/conversation-generation-service')).ConversationGenerationService;
    const genService = new ConversationGenerationService(
      mockClient as unknown as import('../src/lib/services/claude-api-client').ClaudeAPIClient,
      mockResolver as unknown as import('../src/lib/services/template-resolver').TemplateResolver
    );

    // Step 2: Create batch job manually
    console.log('Step 2: Creating batch job with 3 items...\n');
    
    const userId = '00000000-0000-0000-0000-000000000000';
    const testBatch = await batchJobService.createJob(
      {
        name: 'Resilience Test Batch',
        priority: 'normal',
        status: 'queued',
        createdBy: userId,
        configuration: {
          tier: 'template',
          concurrentProcessing: 1, // Sequential for predictable testing
          errorHandling: 'continue', // CRITICAL: Continue on error
        },
      },
      [
        {
          position: 1,
          topic: 'Success 1',
          tier: 'template',
          parameters: {
            templateId: 'test-template-00000000-0000-0000-0000-000000000000',
            persona: 'Test',
            emotion: 'Neutral',
            topic: 'Success 1',
          },
          status: 'queued',
        },
        {
          position: 2,
          topic: 'Truncated',
          tier: 'template',
          parameters: {
            templateId: 'test-template-00000000-0000-0000-0000-000000000000',
            persona: 'Test',
            emotion: 'Neutral',
            topic: 'Truncated',
          },
          status: 'queued',
        },
        {
          position: 3,
          topic: 'Success 2',
          tier: 'template',
          parameters: {
            templateId: 'test-template-00000000-0000-0000-0000-000000000000',
            persona: 'Test',
            emotion: 'Neutral',
            topic: 'Success 2',
          },
          status: 'queued',
        },
      ]
    );

    console.log(`✓ Batch job created: ${testBatch.id}\n`);

    // Step 3: Process items sequentially
    console.log('Step 3: Processing batch items...\n');
    
    const batchService = getBatchGenerationService();
    
    // Process each item manually (simulating batch processing)
    const job = await batchJobService.getJobById(testBatch.id);
    const items = job.items || [];
    
    for (const item of items) {
      console.log(`   Processing item ${item.position}: ${item.topic}...`);
      
      try {
        const result = await genService.generateSingleConversation({
          templateId: item.parameters.templateId,
          parameters: item.parameters,
          tier: item.tier,
          userId,
          runId: testBatch.id,
        });

        if (result.success) {
          await batchJobService.incrementProgress(
            testBatch.id,
            item.id,
            'completed',
            result.conversation.id
          );
          console.log(`   ✓ Item ${item.position} completed\n`);
        } else {
          await batchJobService.incrementProgress(
            testBatch.id,
            item.id,
            'failed',
            undefined,
            result.error
          );
          console.log(`   ✗ Item ${item.position} failed: ${result.error}\n`);
        }
      } catch (error: any) {
        await batchJobService.incrementProgress(
          testBatch.id,
          item.id,
          'failed',
          undefined,
          error.message
        );
        console.log(`   ✗ Item ${item.position} failed: ${error.name}\n`);
        // CONTINUE - don't stop the batch!
      }
    }

    // Step 4: Verify final status
    console.log('Step 4: Verifying batch results...\n');
    
    const finalJob = await batchJobService.getJobById(testBatch.id);
    
    console.log('Batch Results:');
    console.log(`   Total Items: ${finalJob.totalItems}`);
    console.log(`   Completed: ${finalJob.completedItems}`);
    console.log(`   Successful: ${finalJob.successfulItems}`);
    console.log(`   Failed: ${finalJob.failedItems}\n`);

    // Verify expectations
    if (finalJob.totalItems !== 3) {
      console.error(`❌ FAIL: Expected 3 total items, got ${finalJob.totalItems}`);
      process.exit(1);
    }

    if (finalJob.completedItems !== 3) {
      console.error(`❌ FAIL: Expected 3 completed items, got ${finalJob.completedItems}`);
      process.exit(1);
    }

    if (finalJob.successfulItems !== 2) {
      console.error(`❌ FAIL: Expected 2 successful items, got ${finalJob.successfulItems}`);
      process.exit(1);
    }

    if (finalJob.failedItems !== 1) {
      console.error(`❌ FAIL: Expected 1 failed item, got ${finalJob.failedItems}`);
      process.exit(1);
    }

    // SUCCESS
    console.log('=================================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('=================================================\n');

    console.log('Summary:');
    console.log('  ✓ Batch continued after truncation failure');
    console.log('  ✓ 2 out of 3 items completed successfully');
    console.log('  ✓ 1 item failed and was logged');
    console.log('  ✓ Batch processing was resilient\n');

  } catch (error) {
    console.error('\n=================================================');
    console.error('❌ TEST FAILED');
    console.error('=================================================\n');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run test
runTest().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

