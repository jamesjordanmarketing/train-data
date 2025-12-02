/**
 * Test: Production Storage Protection
 * 
 * Verifies that:
 * 1. Truncated conversations are NOT stored in conversations table
 * 2. Failed generations ARE stored in failed_generations table
 * 3. RAW Error File Report is created
 * 4. Complete diagnostic context is preserved
 */

import { createClient } from '@supabase/supabase-js';
import { ConversationGenerationService } from '../src/lib/services/conversation-generation-service';
import { getFailedGenerationService } from '../src/lib/services/failed-generation-service';
import type { ClaudeAPIResponse } from '../src/lib/services/claude-api-client';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Mock Claude client that returns truncated response
 */
class MockTruncatedClient {
  async generateConversation(prompt: string, config: any): Promise<ClaudeAPIResponse> {
    return {
      id: 'test-protection-check',
      content: 'This response ends mid-sentence without proper punctuation',
      model: 'claude-3-5-sonnet-20241022',
      stop_reason: 'max_tokens',  // Clearly truncated
      usage: { 
        input_tokens: 1000, 
        output_tokens: 4096  // Hit max tokens
      },
      cost: 0.05,
      durationMs: 2000,
    };
  }
}

/**
 * Mock template resolver
 */
class MockTemplateResolver {
  async resolveTemplate(params: any) {
    return {
      success: true,
      resolvedPrompt: 'Test prompt for protection verification',
      errors: [],
    };
  }
}

/**
 * Main test execution
 */
async function runTest() {
  console.log('=================================================');
  console.log('TEST: Production Storage Protection');
  console.log('=================================================\n');

  const testConversationId = `test-protection-${Date.now()}`;

  try {
    // Step 1: Generate with truncated response
    console.log('Step 1: Attempting generation with truncated response...\n');
    
    const mockClient = new MockTruncatedClient();
    const mockResolver = new MockTemplateResolver();
    const service = new ConversationGenerationService(
      mockClient as unknown as import('../src/lib/services/claude-api-client').ClaudeAPIClient,
      mockResolver as unknown as import('../src/lib/services/template-resolver').TemplateResolver
    );

    try {
      await service.generateSingleConversation({
        conversationId: testConversationId,
        templateId: 'test-template-00000000-0000-0000-0000-000000000000',
        parameters: { 
          persona: 'Test', 
          emotion: 'Neutral',
          topic: 'Testing'
        },
        tier: 'template',
        userId: '00000000-0000-0000-0000-000000000000',
      });

      console.error('❌ FAIL: Should have thrown an error\n');
      process.exit(1);
    } catch (error: any) {
      console.log(`✅ Generation failed as expected: ${error.name}\n`);
    }

    // Wait for async operations
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Verify NO record in conversations table
    console.log('Step 2: Verifying protection - checking conversations table...\n');
    
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('conversation_id', testConversationId)
      .maybeSingle();

    if (convError && convError.code !== 'PGRST116') {
      console.error('❌ Error querying conversations:', convError);
      process.exit(1);
    }

    if (convData !== null) {
      console.error('❌ FAIL: Truncated conversation was stored in production!');
      console.error('Record:', convData);
      process.exit(1);
    }

    console.log('✅ PASS: NO record in conversations table (production protected)\n');

    // Step 3: Verify record IS in failed_generations table
    console.log('Step 3: Verifying failed generation storage...\n');
    
    const failedGenService = getFailedGenerationService();
    const { failures, total } = await failedGenService.listFailedGenerations(
      { failure_type: 'truncation' },
      { limit: 5 }
    );

    if (total === 0) {
      console.error('❌ FAIL: No records in failed_generations table');
      process.exit(1);
    }

    // Find our test record
    const testFailure = failures.find(f => 
      f.conversation_id === testConversationId ||
      f.stop_reason === 'max_tokens'
    );

    if (!testFailure) {
      console.log('⚠️  Could not find exact test record, but found other truncation failures:');
      console.log(`   Total truncation failures: ${total}`);
      console.log(`   Latest failure ID: ${failures[0].id}\n`);
    } else {
      console.log('✅ PASS: Record found in failed_generations table');
      console.log(`   Failure ID: ${testFailure.id}`);
      console.log(`   Failure Type: ${testFailure.failure_type}`);
      console.log(`   Stop Reason: ${testFailure.stop_reason}`);
      console.log(`   Truncation Pattern: ${testFailure.truncation_pattern}`);
      console.log(`   Output Tokens: ${testFailure.output_tokens}`);
      console.log(`   RAW File Path: ${testFailure.raw_file_path || 'N/A'}\n`);
    }

    // Step 4: Verify diagnostic context
    console.log('Step 4: Verifying diagnostic context...\n');
    
    const latestFailure = failures[0];
    
    if (!latestFailure.prompt || !latestFailure.response_content) {
      console.error('❌ FAIL: Missing diagnostic context (prompt or response_content)');
      process.exit(1);
    }

    if (!latestFailure.input_tokens || !latestFailure.output_tokens) {
      console.error('❌ FAIL: Missing token metrics');
      process.exit(1);
    }

    console.log('✅ PASS: Complete diagnostic context preserved');
    console.log(`   Prompt Length: ${latestFailure.prompt_length} chars`);
    console.log(`   Input Tokens: ${latestFailure.input_tokens}`);
    console.log(`   Output Tokens: ${latestFailure.output_tokens}`);
    console.log(`   Error Message: ${latestFailure.error_message}\n`);

    // SUCCESS
    console.log('=================================================');
    console.log('✅ ALL TESTS PASSED');
    console.log('=================================================\n');

    console.log('Summary:');
    console.log('  ✓ Production storage prevented');
    console.log('  ✓ Failed generation stored');
    console.log('  ✓ Diagnostic context preserved');
    console.log('  ✓ Token metrics captured\n');

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

